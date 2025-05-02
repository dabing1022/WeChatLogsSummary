# 微信群聊日报生成器

这是一个自动化工具，用于从微信群聊记录生成精美的HTML日报。系统支持两种实现方式：Python脚本和BunJS自动化。

## 功能概述

- 自动读取微信群聊记录
- 使用OpenRouter API调用大语言模型（如GPT-4o、Claude 3、Gemini等）
- 生成结构化的HTML日报，包含以下内容：
  - 讨论热点总结
  - 重要消息汇总
  - 话题分类
  - 活跃用户统计
  - 词云可视化
  - 昨日日报回顾链接
- 支持完整版和简化版日报模式
- 自动保存为HTML文件，方便分享

## 系统要求

### BunJS实现

- BunJS运行环境
- chatlog可执行文件（用于解密和访问微信聊天记录）
- OpenRouter API密钥
- 相关依赖：详见package.json

## 安装指南

### BunJS实现

1. 确保已安装BunJS：
   ```bash
   # 检查Bun版本
   bun --version
   ```

2. 准备chatlog可执行文件（放置在工作目录下）

3. 创建`.env`文件，配置以下环境变量：
   ```
   OPENROUTER_API_KEY=你的OpenRouter密钥
   OPENROUTER_MODEL_ID=选择的模型（如google/gemini-2.5-pro-exp-03-25)
   WECHAT_GROUPS=群聊名称
   ```

## 使用方法

### BunJS实现

1. 确保已正确配置`.env`文件

2. 安装依赖并运行：
   ```bash
   # 安装依赖
   bun install
   
   # 运行脚本
   bun start
   ```

3. 脚本执行前，建议执行 chatlog 解密以及启动服务器工作

```sh
# 解密数据库文件
chatlog decrypt
# 启动 HTTP 服务
chatlog server
```

建议用 chatlog 终端交互操作就可以。

![](https://cdn.jsdelivr.net/gh/dabing1022/IMAGES_2025/2025/05/20250503012035223.png)

4. 脚本将自动执行以下步骤：
   - 获取指定群聊的聊天记录
   - 调用OpenRouter API生成日报
   - 保存HTML日报文件（格式为`群名_日期.html`）

## 高级配置

### 自定义提示词

可以编辑`Prompts/p1.md`文件来自定义日报的生成风格和内容。提示词文件包含以下部分：

- 任务描述
- 自动提取信息说明
- 日报模式选择
- 简化版说明
- 支持的聊天记录格式
- HTML输出要求和模板

## 联系与反馈

如有问题或建议，欢迎提 issue 或联系开发者。