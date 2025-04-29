import ora from 'ora';
import chalk from 'chalk';
import { $ } from 'bun';

/**
 * 启动 chatlog 服务器
 * @param {string} execPath - chatlog 可执行文件路径
 * @param {string} addr - 服务器监听地址和端口
 * @param {string} dataDir - 数据目录
 * @param {string} workDir - 工作目录
 * @param {string} platform - 微信平台
 * @param {string} version - 微信版本
 */
async function startChatlogServer(execPath, addr, dataDir, workDir, platform, version) {
  const spinner = ora(chalk.blue('正在启动 chatlog 服务器...')).start();
  const args = [
    'server',
    '--addr', addr,
    '--data-dir', dataDir,
    '--work-dir', workDir,
    '--platform', platform,
    '--version', version,
  ];

  try {
    // 使用 spawn 在后台启动服务器
     Bun.spawn([execPath, ...args], {
        stdout: 'ignore', // 'pipe' or 'inherit' for debugging
        stderr: 'pipe', // Capture stderr
        detached: true, // Run independently
        env: Bun.env,
     });
  } catch (error) {
    spinner.fail(chalk.red('启动 chatlog 服务器时出错:'));
    console.error(chalk.red('执行命令:'), execPath, ...args);
    console.error(error);
    process.exit(1);
  }
}

/**
 * 停止 chatlog 服务器进程
 * @param {string} serverAddr - 服务器监听地址和端口 (e.g., '127.0.0.1:5030')
 */
async function stopChatlogServer(serverAddr) {
  const port = serverAddr.split(':')[1];
  if (!port) {
    console.warn(chalk.yellow(`无法从 serverAddr (${serverAddr}) 解析端口，跳过停止服务器步骤。`));
    return;
  }

  const spinner = ora(chalk.blue(`正在检查并停止端口 ${port} 上的 chatlog 服务器...`)).start();
  try {
    // 使用 lsof 查找监听指定端口的进程 PID
    const findProcessCmd = `lsof -ti :${port}`;
    const proc = Bun.spawnSync(findProcessCmd.split(' '));
    const pid = proc.stdout.toString().trim();

    if (pid) {
      spinner.text = chalk.blue(`找到 PID ${pid} 在端口 ${port} 上运行，正在停止...`);
      // 尝试优雅地停止 (SIGTERM)
      const killProc = Bun.spawnSync(['kill', pid]);
      if (killProc.exitCode === 0) {
         await Bun.sleep(500); // 等待进程退出
         // 再次检查确保进程已停止
         const checkProc = Bun.spawnSync(findProcessCmd.split(' '));
         if (!checkProc.stdout.toString().trim()) {
            spinner.succeed(chalk.green(`成功停止端口 ${port} 上的进程 (PID: ${pid})。`));
         } else {
            spinner.warn(chalk.yellow(`尝试停止 PID ${pid} 但进程仍在运行，可能需要手动干预。`));
         }
      } else {
        spinner.warn(chalk.yellow(`尝试停止 PID ${pid} 失败 (退出码: ${killProc.exitCode})。 stderr: ${killProc.stderr.toString()}`));
        // 可以考虑添加 kill -9 作为后备
      }
    } else {
      spinner.succeed(chalk.gray(`端口 ${port} 上没有找到正在运行的 chatlog 服务器。`));
    }
  } catch (error) {
    spinner.fail(chalk.red(`检查或停止 chatlog 服务器时出错:`));
    console.error(error);
    // 不退出，尝试继续启动
  }
}

export { startChatlogServer, stopChatlogServer };
