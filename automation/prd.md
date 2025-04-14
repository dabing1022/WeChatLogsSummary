# 使用 BunJS 开发群聊信息总结智能体

bun execute path：/Users/childhoodandy/.bun/bin/bun

## OpenRouter API

token 来自.env 文件配置 OPENROUTER_API_KEY
model 有两种：
- openrouter/optimus-alpha
- google/gemini-2.5-pro-exp-03-25:free

```typescript
fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <OPENROUTER_API_KEY>',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'openai/gpt-4o',
    messages: [
      {
        role: 'user',
        content: 'What is the meaning of life?',
      },
    ],
  }),
});
```
## 智能体 system msg

信息来自 ../Prompts/p1.md

读取该文件作为 system msg content

## 逻辑

1. 读取用户输入

- 运行的时候让用户输入群序号

1：Refly 核心用户群
2：chatlog讨论组

- 让用户选择模型

1. openrouter/optimus-alpha
2. google/gemini-2.5-pro-exp-03-25:free

3. 可执行文件路径：/Users/childhoodandy/Documents/Chatlogv0.0.9/chatlog
4. 执行 chatlog decrypt 解密
5. 访问 http://localhost:5030/api/v1/chatlog?time=2025-04-10&talker=Refly%20%E6%A0%B8%E5%BF%83%E7%94%A8%E6%88%B7%E7%BE%A4&limit=10000&offset=0

- time是昨天yyyy-MM-dd 格式
- talker 是运行输入序号对应的群名的 url encode
- limit 是 10000
- offset 是 0

6. 获取到数据后，使用 OpenRouter API 进行总结，使用 system msg 作为 sys msg prompt，使用 chatlog 作为 user msg

7. 终端要能够实时流式输出总结响应，结束后保存到群名+时间.md 文件
