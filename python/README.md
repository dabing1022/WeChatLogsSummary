# 微信群聊内容总结脚本

本脚本可自动读取微信群聊内容，并调用 OpenRouter 大模型（默认 google/gemini-2.5-pro-exp-03-25，可自定义为任意 OpenRouter 支持的模型）生成群聊摘要日报，输出为 HTML 文件。

---

## 环境准备

1. **安装依赖**

   需要 Python 3.7+，并安装 requests 库：

   ```bash
   pip install requests
   ```

2. **准备 API Key**

   - **OpenRouter**：支持多种大模型（如 GPT-4o、Claude 3、Gemini 等）。

   推荐通过环境变量设置 API Key：

   ```bash
   export OPENROUTER_API_KEY="你的OpenRouter API Key"
   ```

3. **准备输入文件**

   - `prompt.md`：你的提示词模板（系统指令）。
   - `群聊内容.txt`：微信群聊原始文本内容（可用任意文件名）。

---

## 脚本用法

```bash
python wechat_summary.py --file 群聊内容.txt [--openrouter-model 模型名]
```

### 参数说明

- `--file`  
  **必填。** 指定要读取的群聊内容文件路径。

- `--openrouter-model`  
  选填。指定 OpenRouter 使用的模型，默认 `google/gemini-2.5-pro-exp-03-25`。可选如 `openai/gpt-4o`, `openai/gpt-4`, `anthropic/claude-3-opus` 等。

---

## 使用示例

### 1. 使用默认模型（google/gemini-2.5-pro-exp-03-25）

```bash
python wechat_summary.py --file 群聊内容.txt
```

### 2. 指定 OpenRouter 其他模型

```bash
python wechat_summary.py --file 群聊内容.txt --openrouter-model openai/gpt-4o
```

---

## 输出结果

- 生成的日报会自动保存为 `wechat_summary_时间戳.html`，保存在当前目录下。
- 日志和进度会在命令行输出，支持 Ctrl+C 中断。

---

## 进阶说明

- **自定义 prompt**：可编辑 `prompt.md`，调整摘要风格和指令。
- **环境变量优先**：如未设置环境变量，脚本会使用代码中的默认 Key（不推荐）。
- **异常处理**：支持自动重试、流式输出、友好报错。

---

## 常见问题

- **429 Too Many Requests**  
  说明 API 被限流，请稍后重试或更换 Key。

- **API Key 无效/未配置**  
  请检查环境变量或脚本顶部的 Key 设置。

- **Ctrl+C 无法中断**  
  本脚本已支持优雅中断，如遇卡死可强制关闭终端。

---

## 联系与反馈

如有问题或建议，欢迎提 issue 或联系开发者。
