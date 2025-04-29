import { $ } from 'bun';
import { format, subDays } from 'date-fns';

import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import { startChatlogServer, stopChatlogServer } from './server.js';

// --- 配置常量 ---
const CHATLOG_EXEC_PATH = './chatlog';
const SERVER_ADDR = Bun.env.SERVER_ADDR || '127.0.0.1:5030';
const SERVER_DATA_DIR = Bun.env.SERVER_DATA_DIR;
const SERVER_WORK_DIR = Bun.env.SERVER_WORK_DIR;
const WECHAT_PLATFORM = Bun.env.WECHAT_PLATFORM || 'darwin';
const WECHAT_VERSION = Bun.env.WECHAT_VERSION || '4';
const OPENROUTER_API_KEY = Bun.env.OPENROUTER_API_KEY;
  const OPENROUTER_MODEL_ID = Bun.env.OPENROUTER_MODEL_ID; // Added model ID from env
  const WECHAT_GROUPS = Bun.env.WECHAT_GROUPS; // Added chat group from env
const SYSTEM_PROMPT_PATH = '../../Prompts/p1.md';
const CHATLOG_API_BASE_URL = `http://${SERVER_ADDR}/api/v1/chatlog`;
const CHATLOG_LIMIT = 10000;
const CHATLOG_OFFSET = 0;

// --- 辅助函数 ---



/**
 * 执行 chatlog 解密命令
 * @param {string} execPath - chatlog 可执行文件路径
 */
async function runDecryption(execPath) {
  const spinner = ora(chalk.blue('正在执行 chatlog decrypt...')).start();
  try {
    const { exitCode, stderr } = await $`${execPath} decrypt`
      .text()
      .then(() => ({ exitCode: 0, stderr: '' }))
      .catch((err) => ({
        exitCode: err.exitCode || 1,
        stderr: err.stderr?.toString() || '未知错误',
      }));

    if (exitCode !== 0) {
      spinner.fail(chalk.red(`chatlog decrypt 执行失败，退出码: ${exitCode}`));
      console.error(chalk.red('Stderr:'), stderr);
      process.exit(1);
    }
    spinner.succeed(chalk.green('chatlog decrypt 执行成功。'));
  } catch (error) {
    spinner.fail(chalk.red('执行 chatlog decrypt 时发生意外错误:'));
    console.error(error);
    process.exit(1);
  }
}


/**
 * 从 API 获取聊天记录
 * @param {string} chatGroup - 群聊名称
 * @returns {Promise<string>} - 聊天记录文本
 */
async function fetchChatLogs(chatGroup) {
  const yesterday = subDays(new Date(), 1);
  const formattedDate = format(yesterday, 'yyyy-MM-dd');
  const encodedTalker = encodeURIComponent(chatGroup);
  const chatlogApiUrl = `${CHATLOG_API_BASE_URL}?time=${formattedDate}&talker=${encodedTalker}&limit=${CHATLOG_LIMIT}&offset=${CHATLOG_OFFSET}`;

  const spinner = ora(chalk.blue(`正在从 ${chatlogApiUrl} 获取聊天记录...`)).start();
  try {
    const response = await fetch(chatlogApiUrl);
    if (!response.ok) {
      throw new Error(
        `API 请求失败，状态码: ${response.status} ${response.statusText}`,
      );
    }
    const chatlogData = await response.text();
    spinner.succeed(chalk.green('成功获取聊天记录。'));
    return chatlogData;
  } catch (error) {
    spinner.fail(chalk.red('获取聊天记录时出错:'));
    console.error(error);
    process.exit(1);
  }
}

/**
 * 读取 System Prompt 文件
 * @param {string} filePath - Prompt 文件路径
 * @returns {Promise<string>} - Prompt 内容
 */
async function readSystemPrompt(filePath) {
  const spinner = ora(chalk.blue(`正在读取 System Prompt 文件: ${filePath}`)).start();
  try {
    const promptFile = Bun.file(filePath);
    if (!(await promptFile.exists())) {
      spinner.fail(chalk.red(`错误: System prompt 文件未找到: ${filePath}`));
      process.exit(1);
    }
    const systemPrompt = await promptFile.text();
    spinner.succeed(chalk.green('成功读取 System Prompt。'));
    return systemPrompt;
  } catch (error) {
    spinner.fail(chalk.red(`读取 System Prompt 文件时出错 (${filePath}):`));
    console.error(error);
    process.exit(1);
  }
}

/**
 * 调用 OpenRouter API 并处理流式响应
 * @param {string} apiKey - OpenRouter API Key
 * @param {string} model - 模型名称
 * @param {string} systemPrompt - 系统提示
 * @param {string} userContent - 用户内容 (聊天记录)
 * @returns {Promise<string>} - 完整的总结文本
 */
async function streamOpenRouterSummary(apiKey, model, systemPrompt, userContent) {
  const spinner = ora(chalk.blue('正在调用 OpenRouter API 进行总结...')).start();
  let fullSummary = '';
  let reader;
  let streamStarted = false;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      spinner.fail(chalk.red('OpenRouter API 请求失败:'));
      console.error(chalk.red(`状态码: ${response.status} ${response.statusText}`));
      console.error(chalk.red(`错误详情: ${errorBody}`));
      process.exit(1);
    }

    if (!response.body) {
        spinner.fail(chalk.red('OpenRouter API 响应体为空'));
        process.exit(1);
    }

    reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let doneReceived = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done || doneReceived) break;

      buffer += decoder.decode(value, { stream: true });

      while (true) {
        const lineEnd = buffer.indexOf('\n');
        if (lineEnd === -1) break;

        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);

        if (line.startsWith('data: ')) {
          if (!streamStarted) {
            spinner.stop();
            console.log(chalk.cyan('\n--- 总结流式输出开始 ---'));
            streamStarted = true;
          }
          const dataContent = line.slice(6).trim();
          if (dataContent === '[DONE]') {
            doneReceived = true;
            break;
          }
          try {
            const chunk = JSON.parse(dataContent);
            if (chunk.error) {
              spinner.stop();
              console.error(chalk.red('\nOpenRouter API 流式传输中返回错误:'));
              console.error(chalk.red(`错误代码: ${chunk.error.code}`));
              console.error(chalk.red(`错误信息: ${chunk.error.message}`));
              process.exit(1);
            }
            const contentPiece = chunk.choices?.[0]?.delta?.content;
            if (contentPiece) {
              process.stdout.write(chalk.white(contentPiece));
              fullSummary += contentPiece;
            }
          } catch (e) {
            console.warn(chalk.yellow('\n忽略无效的 JSON 数据块:'), line, e);
          }
        } else if (line.trim() !== '' && !line.includes('OPENROUTER PROCESSING')) {
        }
      }
    }

    if (buffer.startsWith('data: ')) {
      const dataContent = buffer.slice(6).trim();
      if (dataContent && dataContent !== '[DONE]') {
        try {
          const chunk = JSON.parse(dataContent);
          if (chunk.error) {
            console.error(chalk.red('\nOpenRouter API 在最后的数据块返回错误:'), chunk.error);
          } else {
            const contentPiece = chunk.choices?.[0]?.delta?.content;
            if (contentPiece) {
              process.stdout.write(chalk.white(contentPiece));
              fullSummary += contentPiece;
            }
          }
        } catch (e) {
          console.warn(chalk.yellow('\n解析剩余 buffer 时出错:'), buffer, e);
        }
      }
    }

    if (!streamStarted) {
      spinner.warn(chalk.yellow('未收到任何总结内容。'));
    } else {
      console.log(chalk.cyan('\n--- 总结流式输出结束 ---'));
    }
    return fullSummary;

  } catch (error) {
    spinner.fail(chalk.red('\n调用 OpenRouter API 或处理响应时出错:'));
    console.error(error);
    process.exit(1);
  } finally {
    if (reader) {
        reader.cancel();
    }
  }
}

/**
 * 处理总结文本，移除 HTML Markdown 标记
 * @param {string} summary - 原始总结文本
 * @returns {string} - 处理后的总结文本
 */
function processSummary(summary) {
  return summary
    .replace(/^```(html|HTML)\s*\n/gm, '')
    .replace(/\n```\s*$/gm, '');
}

/**
 * 保存总结到文件
 * @param {string} filePath - 文件路径
 * @param {string} content - 文件内容
 */
async function saveSummary(filePath, content) {
  const spinner = ora(chalk.blue(`正在保存总结到文件: ${filePath}`)).start();
  try {
    await Bun.write(filePath, content);
    spinner.succeed(chalk.green('总结已成功保存。'));
    console.log(chalk.blue('  文件路径:'), filePath);
    console.log(chalk.blue('  内容长度:'), content.length);
  } catch (error) {
    spinner.fail(chalk.red(`保存文件 ${filePath} 时出错:`));
    console.error(error);
    process.exit(1);
  }
}

// --- 主函数 ---
async function main() {
  console.log(chalk.bold.magenta(boxen('微信聊天记录总结自动化脚本', { padding: 1, margin: 1, borderStyle: 'double', borderColor: 'magenta' })));

  // 检查环境变量
  const requiredEnv = ['OPENROUTER_API_KEY', 'OPENROUTER_MODEL_ID', 'WECHAT_GROUPS', 'SERVER_DATA_DIR', 'SERVER_WORK_DIR'];
  const missingEnv = requiredEnv.filter(key => !Bun.env[key]);
  if (missingEnv.length > 0) {
    console.error(chalk.red(boxen(`错误：缺少必要的环境变量: ${missingEnv.join(', ')}。\n请在 .env 文件中设置。`, { padding: 1, margin: 1, borderStyle: 'double', borderColor: 'red' })));
    process.exit(1);
  }
  if (!await Bun.file(CHATLOG_EXEC_PATH).exists()) {
     console.error(chalk.red(boxen(`错误：Chatlog 可执行文件未找到: ${CHATLOG_EXEC_PATH}`, { padding: 1, margin: 1, borderStyle: 'double', borderColor: 'red' })));
     process.exit(1);
  }


  // --- 准备阶段 ---
  console.log(chalk.cyan('\n--- 准备阶段 ---'));

  // // 1. 执行解密 (始终执行)
  // await runDecryption(CHATLOG_EXEC_PATH);

  // // 2. 停止可能正在运行的旧服务器实例
  // await stopChatlogServer(SERVER_ADDR);

  // // 3. 启动新的服务器实例
  // await startChatlogServer(
  //     CHATLOG_EXEC_PATH,
  //     SERVER_ADDR,
  //     SERVER_DATA_DIR,
  //     SERVER_WORK_DIR,
  //     WECHAT_PLATFORM,
  //     WECHAT_VERSION
  //   );

  // --- 总结阶段 ---
   console.log(chalk.cyan('\n--- 总结阶段 ---'));

   // 4. 配置信息从环境变量读取
   const chatGroupChoice = WECHAT_GROUPS;
   const modelChoice = OPENROUTER_MODEL_ID;
   console.log(chalk.green('使用环境变量配置:'));
   console.log(`${chalk.blue('  群聊:')} ${chatGroupChoice}`);
   console.log(`${chalk.blue('  模型:')} ${modelChoice}`);


  // 5. 获取聊天记录
  const chatlogContent = await fetchChatLogs(chatGroupChoice);
  if (!chatlogContent || chatlogContent.trim() === '') {
      console.warn(chalk.yellow(boxen(`警告：获取到的 ${chatGroupChoice} 聊天记录为空或获取失败。无法进行总结。`, { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'yellow' })));
      // 可以选择停止服务器并退出
      // await stopChatlogServer();
      process.exit(0); // 正常退出，因为没有错误，只是没有数据
  }


  // 6. 读取 System Prompt
  const systemPrompt = await readSystemPrompt(SYSTEM_PROMPT_PATH);

  // 7. 调用 API 获取总结
  const rawSummary = await streamOpenRouterSummary(
    OPENROUTER_API_KEY,
    modelChoice,
    systemPrompt,
    chatlogContent
  );

   if (!rawSummary || rawSummary.trim() === '') {
      console.warn(chalk.yellow(boxen(`警告：语言模型返回的总结为空。`, { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'yellow' })));
       // 可以选择停止服务器并退出
      // await stopChatlogServer();
      process.exit(0);
  }

  // 8. 处理总结文本
  const processedSummary = processSummary(rawSummary);

  // 9. 保存总结到文件
  const yesterday = subDays(new Date(), 1);
  const formattedDate = format(yesterday, 'yyyy-MM-dd');
  const outputFileName = `${chatGroupChoice.replace(
    /\s+/g,
    '_',
  )}_${formattedDate}.html`;
  await saveSummary(outputFileName, processedSummary);

  // --- 清理阶段 ---
  // console.log(chalk.cyan('\n--- 清理阶段 ---'));
  // 可以在这里选择是否停止服务器
  // await stopChatlogServer();

  console.log('\n' + chalk.green.bold(boxen('🎉 任务成功完成! 🎉', { padding: 1, margin: 1, borderStyle: 'double', borderColor: 'green' })));
}

// --- 运行主函数 ---
main().catch(error => {
  console.error(chalk.red('\n脚本执行过程中发生未捕获的严重错误:'), error);
  // 尝试在退出前停止服务器，以防万一
  stopChatlogServer(SERVER_ADDR).finally(() => {
      process.exit(1);
  });
});
