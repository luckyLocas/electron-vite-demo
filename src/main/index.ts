import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import MockKoaApi from './koaRoutes';
import SqliteUtil from './sqliteUtil';
import AppConfig from './appConfig';
import fs from 'fs';

export const appAssetsUrl = AppConfig.assertPath;
console.log('数据库地址', AppConfig.sqlitePath);
if (!fs.existsSync(appAssetsUrl)) {
  fs.mkdirSync(appAssetsUrl);
  fs.mkdirSync(appAssetsUrl + '/img');
}
SqliteUtil.init();
let mainWindow: Electron.BrowserWindow;
function createWindow(): void {
  // 创建程序主窗口
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    // autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      nodeIntegration: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false, // 禁用沙盒，当启用沙盒时，渲染器进程将无法访问底层系统资源，如文件系统、系统日志、网络等
      webSecurity: false, // 关闭同源策略
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', function () {
    // 主窗口被关闭时，需将所有子窗口全部关闭
    const data = BrowserWindow.getAllWindows();
    data?.forEach(item => {
      if (item !== mainWindow) {
        item.destroy();
      }
    });
    app.quit();
  });

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url);
    // 'deny' 表示不允许在 Electron 应用内打开新窗口。如果你想要允许在应用内打开新窗口，你可以返回 { action: 'allow' }。
    return { action: 'deny' };
  });

  // 基于electronic vite cli的渲染器HMR。
  // 加载用于开发的远程URL或用于生产的本地html文件。
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/login`);
  } else {
    mainWindow.loadURL('http://localhost:6688/#/login');
    // mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// 禁用当前应用程序的硬件加速
app.disableHardwareAcceleration();
/**
 * 防止项目重复启动
 */
const isFirstInstance = app.requestSingleInstanceLock();
if (!isFirstInstance) {
  app.quit();
} else {
  // 创建api
  new MockKoaApi();

  // 此方法将在Electron完成后调用
  // 初始化，并准备创建浏览器窗口。
  // 某些API只能在此事件发生后使用。
  app.whenReady().then(() => {
    // 设置windows的应用程序用户模型id
    electronApp.setAppUserModelId('com.electron');

    // 在开发环境中默认按 F12 打开或关闭 DevTools
    // 在生产环境中忽略 CommandOrControl + R。
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });
    // IPC test
    ipcMain.on('ping', (event, arg) => {
      console.log('pong', event, arg);
      checkIp(arg);
    });
    createWindow();

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
  app.on('second-instance', (_event, commanLine) => {
    console.log('new app started', commanLine);
    if (mainWindow) {
      mainWindow.focus();
      mainWindow.restore();
    }
  });
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

const { exec } = require('child_process');

function checkIp(ip) {
  // 要执行的shell脚本命令
  const shellCommand = `ping ${ip}`;

  exec(shellCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`执行错误: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);

    // 脚本的返回值通常通过退出码给出，可以通过error对象获取
    const exitCode = error ? error.code : 0;
    console.log(`脚本退出码: ${exitCode}`);
  });
}

// console.log('process.argv', process);
console.log(import.meta.env.MODE);
