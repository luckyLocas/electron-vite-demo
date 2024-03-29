import { app } from 'electron';
import path from 'path';

export default class AppConfig {
  /** 软件缓存地址 */
  static userDataPath = app.getPath('userData');

  /** sqlite 存放名称 */
  static sqlitePath = app.isPackaged
    ? path.join(path.dirname(app.getPath('exe')), '../app-assets', 'app_db.db')
    : path.join(this.userDataPath, 'app_db.db');

  /** 图片文件目录 */
  static assertPath = app.isPackaged
    ? path.join(path.dirname(app.getPath('exe')), '../', 'app-assets')
    : path.join(this.userDataPath, 'app-assets');

  /** 日志文件存储目录 */
  static logSavePath = app.isPackaged
    ? path.join(path.dirname(app.getPath('exe')), '../', 'app-logs')
    : path.join(this.userDataPath, 'app-logs');

  /** 数据库版本 */
  static dbVersion = 1;

  /** 客户端版本 */
  static clientVersion = '1.0.0';
}
