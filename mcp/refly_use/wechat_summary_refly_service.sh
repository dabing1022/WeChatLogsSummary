#!/bin/bash

# 定义颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 无颜色

# 定义服务名和路径
SERVICE_NAME="微信聊天记录摘要MCP服务"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_SCRIPT="${SCRIPT_DIR}/wechat_summary_refly_mcp_server.py"
PID_FILE="${SCRIPT_DIR}/.wechat_summary_refly_mcp.pid"
LOG_FILE="${SCRIPT_DIR}/wechat_summary_refly_mcp.log"

# 工作目录 - 设置为项目根目录
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# 使用netstat检查服务端口是否已经在监听
check_port() {
    PORT=$1
    netstat -an | grep "LISTEN" | grep ":$PORT " >/dev/null
    return $?
}

# 检查Python环境
check_dependencies() {
    echo -e "${BLUE}检查依赖...${NC}"
    
    # 检查Python是否安装
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}错误: 找不到Python3${NC}"
        exit 1
    fi
    
    # 检查依赖包
    python3 -c "import fastmcp, aiohttp" 2>/dev/null
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}警告: 缺少必要的Python包。尝试安装...${NC}"
        pip install fastmcp aiohttp
        
        # 再次检查
        python3 -c "import fastmcp, aiohttp" 2>/dev/null
        if [ $? -ne 0 ]; then
            echo -e "${RED}错误: 安装Python依赖失败${NC}"
            echo -e "${YELLOW}请手动执行: pip install fastmcp aiohttp${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}依赖检查通过${NC}"
}

# 检查服务状态
check_status() {
    # 首先检查日志文件中是否包含服务启动信息
    if [ -f "$LOG_FILE" ] && grep -q "Starting server" "$LOG_FILE"; then
        # 检查服务是否在监听端口（FastMCP默认端口为2727）
        if lsof -i :2727 > /dev/null 2>&1 || netstat -an | grep "LISTEN" | grep -q ":2727 "; then
            echo -e "${GREEN}$SERVICE_NAME 正在运行 (监听端口 2727)${NC}"
            return 0
        # 如果PID文件存在且进程在运行
        elif [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if ps -p $PID > /dev/null; then
                echo -e "${GREEN}$SERVICE_NAME 正在运行 [PID: $PID]${NC}"
                return 0
            else
                echo -e "${YELLOW}$SERVICE_NAME 可能未正确运行 (PID文件存在但进程已结束)${NC}"
                rm -f "$PID_FILE"
            fi
        fi
        
        # 查找可能的Python进程
        PIDS=$(ps -ef | grep "python.*mcp_server" | grep -v grep | awk '{print $2}')
        if [ -n "$PIDS" ]; then
            echo -e "${GREEN}$SERVICE_NAME 可能正在运行，检测到相关进程: $PIDS${NC}"
            # 更新PID文件
            echo $PIDS | awk '{print $1}' > "$PID_FILE"
            return 0
        fi
        
        echo -e "${YELLOW}$SERVICE_NAME 状态未知 (服务可能已启动但无法确认进程)${NC}"
        return 1
    else
        echo -e "${YELLOW}$SERVICE_NAME 未运行${NC}"
        return 1
    fi
}

# 启动服务
start_service() {
    echo -e "${BLUE}正在启动 $SERVICE_NAME...${NC}"
    
    # 检查服务是否已经在运行
    if check_status >/dev/null; then
        echo -e "${YELLOW}$SERVICE_NAME 已经在运行中${NC}"
        return 0
    fi
    
    # 切换到项目根目录
    cd "$PROJECT_ROOT"
    echo -e "${BLUE}工作目录: $(pwd)${NC}"
    
    # 打印环境信息
    echo -e "${BLUE}Python版本: $(python3 --version)${NC}"
    echo -e "${BLUE}启动命令: python3 \"$SERVER_SCRIPT\"${NC}"
    
    # 清除之前的日志文件
    > "$LOG_FILE"
    
    # 启动服务
    nohup python3 "$SERVER_SCRIPT" > "$LOG_FILE" 2>&1 &
    MAIN_PID=$!
    echo $MAIN_PID > "$PID_FILE"
    
    # 等待确认服务启动 (最多等待10秒)
    echo -e "${BLUE}等待服务启动...${NC}"
    for i in {1..20}; do
        # 检查日志是否包含启动成功的信息
        if grep -q "Starting server" "$LOG_FILE"; then
            echo -e "${GREEN}$SERVICE_NAME 已启动${NC}"
            echo -e "${BLUE}日志内容:${NC}"
            cat "$LOG_FILE"
            echo -e "${GREEN}$SERVICE_NAME 已成功启动${NC}"
            return 0
        fi
        sleep 0.5
    done
    
    # 如果主进程已经退出，但日志中有启动信息，可能是成功启动了后台服务
    if ! ps -p $MAIN_PID > /dev/null && grep -q "Starting server" "$LOG_FILE"; then
        echo -e "${GREEN}$SERVICE_NAME 可能已成功在后台启动${NC}"
        echo -e "${BLUE}日志内容:${NC}"
        cat "$LOG_FILE"
        
        # 查找可能的后台进程
        check_status
        return 0
    fi
    
    # 如果到这里，说明启动可能失败
    echo -e "${RED}启动 $SERVICE_NAME 可能失败${NC}"
    echo -e "${YELLOW}日志内容:${NC}"
    cat "$LOG_FILE"
    
    # 尝试终止可能的残留进程
    if ps -p $MAIN_PID > /dev/null; then
        kill $MAIN_PID 2>/dev/null
    fi
    rm -f "$PID_FILE"
    return 1
}

# 停止服务
stop_service() {
    echo -e "${BLUE}正在停止 $SERVICE_NAME...${NC}"
    
    # 尝试找到并终止所有相关进程
    local found_process=0
    
    # 查找监听2727端口的进程
    local PORT_PIDS=$(lsof -ti :2727 2>/dev/null)
    if [ -n "$PORT_PIDS" ]; then
        echo -e "${BLUE}找到监听2727端口的进程: $PORT_PIDS${NC}"
        for pid in $PORT_PIDS; do
            echo -e "${BLUE}正在终止进程 $pid...${NC}"
            kill $pid 2>/dev/null
            found_process=1
        done
    fi
    
    # 如果存在PID文件，尝试终止对应进程
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null; then
            echo -e "${BLUE}正在终止PID文件中的进程 $PID...${NC}"
            kill $PID 2>/dev/null
            found_process=1
        fi
    fi
    
    # 查找其他可能的服务相关进程
    local OTHER_PIDS=$(ps -ef | grep "python.*wechat_summary_refly_mcp_server" | grep -v grep | awk '{print $2}')
    if [ -n "$OTHER_PIDS" ]; then
        echo -e "${BLUE}找到其他可能相关的进程: $OTHER_PIDS${NC}"
        for pid in $OTHER_PIDS; do
            echo -e "${BLUE}正在终止进程 $pid...${NC}"
            kill $pid 2>/dev/null
            found_process=1
        done
    fi
    
    # 如果没有找到任何进程
    if [ $found_process -eq 0 ]; then
        echo -e "${YELLOW}未找到正在运行的 $SERVICE_NAME 进程${NC}"
        rm -f "$PID_FILE" 2>/dev/null
        return 0
    fi
    
    # 等待所有进程终止
    echo -e "${BLUE}等待进程终止...${NC}"
    sleep 3
    
    # 检查是否所有进程都已终止
    if lsof -ti :2727 >/dev/null 2>&1 || ps -ef | grep -q "python.*wechat_summary_refly_mcp_server" | grep -v grep; then
        echo -e "${YELLOW}一些进程未能正常终止，尝试强制终止...${NC}"
        
        # 再次尝试查找并强制终止进程
        PORT_PIDS=$(lsof -ti :2727 2>/dev/null)
        if [ -n "$PORT_PIDS" ]; then
            kill -9 $PORT_PIDS 2>/dev/null
        fi
        
        OTHER_PIDS=$(ps -ef | grep "python.*wechat_summary_refly_mcp_server" | grep -v grep | awk '{print $2}')
        if [ -n "$OTHER_PIDS" ]; then
            kill -9 $OTHER_PIDS 2>/dev/null
        fi
        
        sleep 2
    fi
    
    # 最终确认
    if lsof -ti :2727 >/dev/null 2>&1 || ps -ef | grep -q "python.*wechat_summary_refly_mcp_server" | grep -v grep; then
        echo -e "${RED}无法终止所有 $SERVICE_NAME 相关进程${NC}"
        return 1
    else
        echo -e "${GREEN}$SERVICE_NAME 已成功停止${NC}"
        rm -f "$PID_FILE" 2>/dev/null
        return 0
    fi
}

# 重启服务
restart_service() {
    echo -e "${BLUE}正在重启 $SERVICE_NAME...${NC}"
    stop_service
    sleep 2
    start_service
}

# 显示日志
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        echo -e "${BLUE}显示最近100行日志:${NC}"
        tail -n 100 "$LOG_FILE"
    else
        echo -e "${YELLOW}日志文件不存在: $LOG_FILE${NC}"
    fi
}

# 命令行参数处理
case "$1" in
    start)
        check_dependencies
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        check_dependencies
        restart_service
        ;;
    status)
        check_status
        ;;
    logs)
        show_logs
        ;;
    *)
        echo -e "${BLUE}用法: $0 {start|stop|restart|status|logs}${NC}"
        echo -e "  start   - 启动服务"
        echo -e "  stop    - 停止服务"
        echo -e "  restart - 重启服务"
        echo -e "  status  - 检查服务状态"
        echo -e "  logs    - 显示服务日志"
        exit 1
        ;;
esac

exit 0 