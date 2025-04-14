import { $ } from 'bun';
import { format, subDays } from 'date-fns';
import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';

// --- 配置常量 ---
const CHATLOG_EXEC_PATH = '/Users/childhoodandy/Documents/Chatlogv0.0.9/chatlog';
const OPENROUTER_API_KEY = Bun.env.OPENROUTER_API_KEY;
const SYSTEM_PROMPT_PATH = '../../Prompts/p1.md';
const CHATLOG_API_BASE_URL = 'http://localhost:5030/api/v1/chatlog';
const CHATLOG_LIMIT = 10000;
const CHATLOG_OFFSET = 0;

// --- 辅助函数 ---

/**
 * 获取用户输入：群聊、模型、是否解密
 */
async function getUserInput() {
  console.log(chalk.cyan(boxen('开始配置总结任务', { padding: 1, margin: 1, borderStyle: 'round' })));

  const chatGroupChoice = await select({
    message: chalk.yellow('请选择要总结的群聊:'),
    choices: [
      { name: 'Refly 核心用户群', value: 'Refly 核心用户群' },
      { name: 'chatlog讨论组', value: 'chatlog讨论组' },
    ],
  });

  const modelChoice = await select({
    message: chalk.yellow('请选择使用的语言模型:'),
    choices: [
      { name: 'openrouter/optimus-alpha', value: 'openrouter/optimus-alpha' },
      {
        name: 'google/gemini-2.5-pro-exp-03-25:free',
        value: 'google/gemini-2.5-pro-exp-03-25:free',
      },
    ],
  });

  const needDecrypt = await select({
    message: chalk.yellow('是否需要执行数据库解密? (如果昨天或今天已解密过，选否)'),
    choices: [
      { name: '是，需要解密', value: true },
      { name: '否，已解密', value: false },
    ],
  });

  console.log('\n' + chalk.green('配置完成:'));
  console.log(`${chalk.blue('  群聊:')} ${chatGroupChoice}`);
  console.log(`${chalk.blue('  模型:')} ${modelChoice}`);
  console.log(`${chalk.blue('  解密:')} ${needDecrypt ? chalk.red('是') : chalk.green('否')}`);

  return { chatGroupChoice, modelChoice, needDecrypt };
}

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
  // 检查 API Key
  if (!OPENROUTER_API_KEY) {
    console.error(chalk.red(boxen('错误：未找到 OPENROUTER_API_KEY 环境变量。请在 .env 文件中设置。', { padding: 1, margin: 1, borderStyle: 'double', borderColor: 'red' })));
    process.exit(1);
  }

  // 1. 获取用户输入
  const { chatGroupChoice, modelChoice, needDecrypt } = await getUserInput();

  // 2. 执行解密 (如果需要)
  if (needDecrypt) {
    await runDecryption(CHATLOG_EXEC_PATH);
  } else {
    console.log(chalk.gray('\n-> 跳过解密步骤。'));
  }

  // 3. 获取聊天记录
  const chatlogContent = await fetchChatLogs(chatGroupChoice);

  // 4. 读取 System Prompt
  const systemPrompt = await readSystemPrompt(SYSTEM_PROMPT_PATH);

  // 5. 调用 API 获取总结
  const rawSummary = await streamOpenRouterSummary(
    OPENROUTER_API_KEY,
    modelChoice,
    systemPrompt,
    chatlogContent
  );

  // 6. 处理总结文本
  const processedSummary = processSummary(rawSummary);

  // 7. 保存总结到文件
  const yesterday = subDays(new Date(), 1);
  const formattedDate = format(yesterday, 'yyyy-MM-dd');
  const outputFileName = `${chatGroupChoice.replace(
    /\s+/g,
    '_',
  )}_${formattedDate}.html`;
  await saveSummary(outputFileName, processedSummary);

  console.log('\n' + chalk.green.bold(boxen('🎉 任务成功完成! 🎉', { padding: 1, margin: 1, borderStyle: 'double', borderColor: 'green' })));
}

// --- 运行主函数 ---
main().catch(error => {
  console.error(chalk.red('\n脚本执行过程中发生未捕获的严重错误:'), error);
  process.exit(1);
});
