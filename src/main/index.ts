import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import MockKoaApi from './koaRoutes';

function createWindow(): void {
  // 创建程序主窗口
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    // autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false, // 禁用沙盒，当启用沙盒时，渲染器进程将无法访问底层系统资源，如文件系统、系统日志、网络等
      webSecurity: false, // 关闭同源策略
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // 基于electronic vite cli的渲染器HMR。
  // 加载用于开发的远程URL或用于生产的本地html文件。
  console.log('process.env', process.env['ELECTRON_RENDERER_URL']);

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
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

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });
    // IPC test
    ipcMain.on('ping', () => console.log('pong'));

    createWindow();

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

// console.log('process.argv', process);
console.log(import.meta.env.MODE);
