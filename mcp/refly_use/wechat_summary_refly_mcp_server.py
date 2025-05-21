from fastmcp import FastMCP
from datetime import datetime, timedelta
import aiohttp
from pathlib import Path
import os
import sys
from typing import Dict, Any
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("WeChatSummaryMCP")
logger.setLevel(logging.INFO)

# 确保正确的路径
# 如果是通过相对路径运行，需要调整工作目录到项目根目录
if not os.path.isabs(__file__):
    script_path = os.path.abspath(__file__)
else:
    script_path = __file__
    
# 设置项目根目录到系统路径
project_root = os.path.dirname(os.path.dirname(os.path.dirname(script_path)))
sys.path.insert(0, project_root)

# 打印路径信息，方便调试
logger.info(f"脚本路径: {script_path}")
logger.info(f"项目根目录: {project_root}")
logger.info(f"当前工作目录: {os.getcwd()}")

# 创建MCP实例
MCP_SERVICE_NAME = "微信日报摘要MCP 🚀"
MCP_HOST = "127.0.0.1"
MCP_PORT = 2727

logger.info(f"初始化 {MCP_SERVICE_NAME} 服务 (主机: {MCP_HOST}, 端口: {MCP_PORT})")
mcp = FastMCP(MCP_SERVICE_NAME)

# 配置
CHATLOG_API_BASE_URL = "http://127.0.0.1:5030/api/v1/chatlog"
CHATLOG_LIMIT = 10000
CHATLOG_OFFSET = 0
PROMPT_PATH = os.path.join(project_root, "Prompts/Refly1.md")

logger.info(f"配置信息: PROMPT_PATH={PROMPT_PATH}")
logger.info(f"配置信息: CHATLOG_API_BASE_URL={CHATLOG_API_BASE_URL}")

@mcp.tool()
async def get_prompt() -> Dict[str, Any]:
    """获取 Refly1.md 中的微信群日报提示词"""
    logger.info("调用工具: get_prompt")
    try:
        prompt_path = Path(PROMPT_PATH)
        if not prompt_path.exists():
            logger.error(f"提示词文件不存在: {PROMPT_PATH}")
            return {"error": f"提示词文件不存在: {PROMPT_PATH}"}
            
        with open(prompt_path, 'r', encoding='utf-8') as f:
            content = f.read()
            logger.info(f"成功读取提示词文件，长度: {len(content)}字符")
            return {"content": content}
                
    except Exception as e:
        logger.error(f"读取提示词文件时出错: {str(e)}", exc_info=True)
        return {"error": f"读取提示词文件时出错: {str(e)}"}

@mcp.tool()
async def get_yesterday_chat_logs() -> Dict[str, Any]:
    """获取昨日 Refly 核心用户群的聊天记录"""
    logger.info("调用工具: get_yesterday_chat_logs")
    try:
        # 计算昨天的日期
        yesterday = datetime.now() - timedelta(days=1)
        formatted_date = yesterday.strftime('%Y-%m-%d')
        logger.info(f"获取日期: {formatted_date}")
        
        # 构建 API URL
        chat_group = "Refly 核心用户群"
        encoded_talker = chat_group.replace(" ", "%20")
        url = f"{CHATLOG_API_BASE_URL}?time={formatted_date}&talker={encoded_talker}&limit={CHATLOG_LIMIT}&offset={CHATLOG_OFFSET}"
        logger.info(f"请求URL: {url}")
        
        # 发送请求获取聊天记录
        async with aiohttp.ClientSession() as session:
            logger.info("发送HTTP请求...")
            async with session.get(url) as response:
                if response.status != 200:
                    logger.error(f"获取聊天记录失败: HTTP {response.status}")
                    return {"error": f"获取聊天记录失败: HTTP {response.status}"}
                    
                chat_logs = await response.text()
                logger.info(f"成功获取聊天记录，长度: {len(chat_logs)}字符")
                return {"content": chat_logs}
                
    except Exception as e:
        logger.error(f"获取聊天记录时出错: {str(e)}", exc_info=True)
        return {"error": f"获取聊天记录时出错: {str(e)}"}

if __name__ == "__main__":
    logger.info(f"准备启动MCP服务器 (HTTP模式)")
    try:
        mcp.run(
            transport="streamable-http",
            host="127.0.0.1",
            port=2727,
            path="/mcp"
        )
    except Exception as e:
        logger.error(f"启动MCP服务器时出错: {str(e)}", exc_info=True)
