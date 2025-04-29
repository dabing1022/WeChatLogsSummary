import os
import requests
import json
import datetime
import sys
import argparse

# --- 配置区 ---
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "你的OpenRouter API Key")
PROMPT_FILE = "prompt.md"
OPENROUTER_MODEL = "google/gemini-2.5-pro-exp-03-25"  # 默认模型
OUTPUT_DIR = "./output"

# --- 日志函数 (可选，让日志更清晰) ---
def log_info(message):
    print(f"\033[96m[信息]\033[0m {message}")

def log_debug(message):
    print(f"\033[94m[调试]\033[0m {message}")

def log_warn(message):
    print(f"\033[93m[警告]\033[0m {message}", file=sys.stderr)

def log_error(message):
    print(f"\033[91m[错误]\033[0m {message}", file=sys.stderr)


def read_prompt(filename):
    """读取指定文件中的 prompt 内容"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        log_error(f"未找到提示词文件：'{filename}'，请检查路径。")
        sys.exit(1)
    except Exception as e:
        log_error(f"读取提示词文件 '{filename}' 时发生异常：{e}")
        sys.exit(1)

def read_chat_group_file(filename):
    """读取群聊内容文件"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        log_error(f"未找到群聊内容文件：'{filename}'")
        sys.exit(1)
    except Exception as e:
        log_error(f"读取群聊内容文件 '{filename}' 时发生异常：{e}")
        sys.exit(1)

def save_as_html(content, output_dir):
    """将内容保存为带时间戳的 HTML 文件"""
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = os.path.join(output_dir, f"wechat_summary_{timestamp}.html")
    import re
    processed_content = re.sub(r"^```(html|HTML)\s*\n", "", content, flags=re.MULTILINE)
    html_content = re.sub(r"\n```\s*$", "", processed_content, flags=re.MULTILINE)
    try:
        os.makedirs(output_dir, exist_ok=True)
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f"\033[92m[成功]\033[0m 日报已保存至：\033[4m{filename}\033[0m")
    except Exception as e:
        log_error(f"保存 HTML 文件 '{filename}' 时出错：{e}")
        sys.exit(1)

def generate_summary_openrouter(api_key, model, system_prompt, user_content):
    """使用 OpenRouter API（兼容 OpenAI 格式，流式）生成内容"""
    if not api_key:
        log_error("未配置 OpenRouter API 密钥。")
        sys.exit(1)

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream" # 明确要求 SSE
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        "stream": True
    }

    log_info(f"正在向 OpenRouter API 发送流式请求：{url}")

    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload), stream=True, timeout=300)

        log_info(f"收到响应，状态码：{response.status_code}")

        if response.status_code != 200:
            log_error(f"OpenRouter API 请求失败，状态码：{response.status_code}")
            try:
                 error_text = response.text # 尝试读取错误文本
                 log_error(f"错误响应内容: {error_text}")
            except Exception as read_err:
                 log_error(f"读取错误响应内容失败: {read_err}")
            sys.exit(1)

        summary = ""
        print("\033[92m[进度]\033[0m 正在接收流式数据：", end="", flush=True)

        log_debug("准备开始迭代 response.iter_lines()...") # <-- 循环前日志
        line_count = 0
        for line in response.iter_lines():
            line_count += 1
            if line:
                try:
                    decoded = line.decode("utf-8").strip()
                    if decoded.startswith("data: "):
                        data = decoded[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            content_piece = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
                            if content_piece:
                                print("\033[92m●\033[0m", end="", flush=True)
                                print(content_piece, end="", flush=True)
                                summary += content_piece
                            else:
                                log_debug("    JSON 解析成功，但 content_piece 为空。")
                        except Exception as e:
                            log_warn(f"JSON 解析失败: {e}，原始数据: '{data}'")
                    # else: # 可以取消注释来看非 data: 开头的行
                    #     log_debug(f"    忽略非 'data:' 开头的行: '{decoded}'")
                except UnicodeDecodeError as ude:
                     log_warn(f"UTF-8 解码失败: {ude}, 原始字节: {line!r}")

        log_info(f"流式接收完毕。总共迭代 {line_count} 次。")
        return summary

    except requests.exceptions.RequestException as req_err:
        log_error(f"网络请求异常: {req_err}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\033[93m[中断]\033[0m 用户主动终止了请求。")
        sys.exit(130)
    except Exception as e:
        import traceback
        log_error(f"处理流式响应时发生未知错误: {e}")
        log_error(traceback.format_exc()) # 打印完整 traceback
        sys.exit(1)


# --- 主程序入口 ---
if __name__ == "__main__":
    try:
        parser = argparse.ArgumentParser(description="微信群聊日报生成器（仅支持 OpenRouter）")
        parser.add_argument('--file', type=str, required=True, help='群聊内容文件路径')
        parser.add_argument('--openrouter-model', type=str, default=OPENROUTER_MODEL, help='OpenRouter 模型名称，默认 google/gemini-2.5-pro-exp-03-25')
        args = parser.parse_args()

        chat_group_file = args.file
        openrouter_model = args.openrouter_model

        log_info(f"正在读取提示词文件：\033[4m{PROMPT_FILE}\033[0m ...")
        system_prompt_content = read_prompt(PROMPT_FILE)

        log_info(f"正在读取群聊内容文件：\033[4m{chat_group_file}\033[0m ...")
        user_chat_content = read_chat_group_file(chat_group_file)

        log_info(f"当前使用的 OpenRouter 模型：{openrouter_model}")
        summary_content = generate_summary_openrouter(
            OPENROUTER_API_KEY,
            openrouter_model,
            system_prompt_content,
            user_chat_content
        )

        if summary_content:
            log_info(f"正在保存日报到 HTML 文件目录：\033[4m{OUTPUT_DIR}\033[0m ...")
            save_as_html(summary_content, OUTPUT_DIR)
            print("\033[92m[完成]\033[0m 脚本执行完毕，祝你有美好的一天！")
        else:
            log_error("未生成任何日报内容。")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\033[93m[中断]\033[0m 用户主动终止了程序。")
        sys.exit(130)
