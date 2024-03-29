export interface IDBFiled {
  /** 数据类型 */
  type: 'integer' | 'text';
  notNull?: boolean;
  defaultValue?: any;
  /** 是否是主键 */
  primaryKey?: boolean;
}

export interface IDBTable {
  tableName: string;
  fileds: Record<string, IDBFiled>;
}

export interface IDBBaseFiled {
  id: string;
  create: number;
}

export const IBaseFileds: Record<string, IDBFiled> = {
  id: {
    type: 'text',
    notNull: true,
    primaryKey: true,
  },
  createTime: {
    type: 'integer',
    notNull: true,
  },
  updateTime: {
    type: 'integer',
    notNull: true,
  },
};

export type IDBOmitInterface = 'id' | 'createTime';
