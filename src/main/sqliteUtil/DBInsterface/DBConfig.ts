import { IBaseFileds, IDBBaseFiled, IDBTable } from './baseDBInterface';

export const IDBConfigGen: IDBTable = {
  tableName: 't_config',
  fileds: {
    ...IBaseFileds,
    key: { type: 'text', notNull: true },
    value: { type: 'text', notNull: true },
    type: { type: 'text', notNull: true },
  },
};

export enum EDBConfigkey {
  /** 数据库当前版本号 */
  VERSION = 'version',
  /** 日志数据导出时间 */
  EXPORT_LOG_DATE = 'export_log_date',
  /** 绑定信息 */
  BIND_INFO = 'bind_info',
}

export const IDBInitConfig: {
  key: EDBConfigkey;
  value: any;
  must?: boolean;
}[] = [
  {
    key: EDBConfigkey.EXPORT_LOG_DATE,
    value: +new Date(),
  },
];

export interface IDBConfig extends IDBBaseFiled {
  key: string;
  value: string;
  type: string;
}
