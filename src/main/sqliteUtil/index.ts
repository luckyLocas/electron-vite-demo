import Database from 'better-sqlite3';
import fs from 'fs';
import omit from './omitUtil';
import { v4 } from 'uuid';
import AppConfig from '../appConfig';
import { EDBConfigkey, IDBConfig, IDBConfigGen, IDBInitConfig } from './DBInsterface/DBConfig';
import { IDBTable } from './DBInsterface/baseDBInterface';
import { SyncType } from './enum';

function randomNum(minNum: number, maxNum: number) {
  switch (arguments.length) {
    case 1:
      return parseInt((Math.random() * minNum + 1).toString(), 10);
    case 2:
      return parseInt((Math.random() * (maxNum - minNum + 1) + minNum).toString(), 10);
    default:
      return 0;
  }
}

export const buildSnowflakeId = () => {
  return (+new Date()).toString() + randomNum(1000, 9999);
};

export interface ISqliteWhereBuildFileds {
  fileds: string;
  value: string;
  type: '=' | '>' | '!=' | '<';
  condition: 'and' | 'or';
  children?: ISqliteWhereBuildFileds[];
}

export const ISqlitePageConditionOmit = ['pageSize', 'pageNum', 'current', 'tableName'];

export interface ISqlitePageCondition {
  pageSize: number;
  pageNum: number;
}

export default class SqliteUtil {
  static version: number = AppConfig.dbVersion;
  /**需双向同步的数据表 */
  static hasAsyncTable = ['t_company'];
  /**需拼接项目ID的数据表 */
  static joinProid = ['t_material'];
  /**需拼接项目ID及磅房ID的数据表 */
  static joinPoundId = ['t_verhicle'];

  /**数据库实例 */
  static db: Database.Database;

  private static createTableSql = [IDBConfigGen];

  public static objectPmitPage(obj: any) {
    return omit(obj, ISqlitePageConditionOmit);
  }

  /**初始化sqlite */
  public static init() {
    console.log('数据库地址：', AppConfig.sqlitePath);
    const exit = fs.existsSync(AppConfig.sqlitePath);
    this.db = new Database(AppConfig.sqlitePath, { verbose: console.log });
    // 如果不存在此文件
    if (!exit) {
      this.createTableSql.forEach(p => {
        this.createTable(p);
      });
    }
    /**先检查数据库版本升级 */
    this.upgradeDB();
    /**初始化默认配置 */
    const _initConfig: Record<string, any> = {};
    IDBInitConfig.forEach(p => {
      _initConfig[p.key] = p.value;
    });
    this.setConfig(_initConfig, true);
  }

  /**创建表 */
  static createTable(model: IDBTable) {
    const fileds: string[] = [];
    for (const key in model.fileds) {
      const element = model.fileds[key];
      fileds.push(
        `"${key}" ${element.type} ${element.notNull ? 'NOT NULL' : ''} ${element.primaryKey ? 'PRIMARY KEY' : ''}`,
      );
    }
    const strSql = `create table "${model.tableName}" (${fileds.join(',')})`;
    this.db.prepare(strSql).run();
  }

  /**获取数据库版本号 */
  static getVersion(): number {
    const data = this.db
      .prepare('SELECT VALUE FROM t_config WHERE key=?')
      .get(EDBConfigkey.VERSION.toString()) as IDBConfig;
    return +data.value;
  }

  /**获取所有配置 */
  static getConfigRecord(onlys?: EDBConfigkey[]) {
    onlys ??= [];
    let str = '';
    if (onlys.length !== 0) {
      str = ' where ';
      str + ` key in(${onlys}) `;
    }

    const result: any = this.db.prepare(`Select * from ${IDBConfigGen.tableName} ${str}`).all(...onlys);
    const data: Record<string, any> = {};
    for (const key in result) {
      const element: { value: string; type: string; key: string } = result[key];
      if (element.type === 'number') {
        data[element.key] = +element.value;
      } else {
        data[element.key] = element.value;
      }
    }
    return data;
  }

  /**
   * 自定义JSON.parse方法
   * @param str
   * @returns
   */
  static customParse(str: any = '{}') {
    str = str.replace(/\n/g, '\\n');
    str = str.replace(/\r/g, '\\r');
    str = str.replace(/\t/g, '\\t');
    str = str.replace(/</g, '&lt;');
    str = str.replace(/>/g, '&gt;');
    return JSON.parse(str);
  }

  /** 获取绑定的磅房信息 */
  static getBindPoundInfo() {
    const info = (
      this.db.prepare('SELECT value FROM t_config WHERE key=?').get(EDBConfigkey.BIND_INFO.toString()) as IDBConfig
    )?.value;
    const bindInfo = this.customParse(info || '{}');
    return bindInfo;
  }

  static getConfig(): IDBConfig[] {
    const result = this.db.prepare(`Select * from ${IDBConfigGen.tableName}`).all() as IDBConfig[];
    return result;
  }

  /** 设置配置数据 */
  static setConfig(config: Record<string, any>, init = false) {
    const _select = this.getConfig();
    const updateList: any[] = [];
    const insertList: any[] = [];
    const insert = this.db.prepare(
      `insert into ${IDBConfigGen.tableName}(id,createTime,key,value,type,updateTime) values(@id,@createTime,@key,@value,@type,@updateTime);`,
    );
    const insertMany = this.db.transaction(cats => {
      for (const cat of cats) insert.run(cat);
    });

    const update = this.db.prepare(`update ${IDBConfigGen.tableName} set value=@value where id=@id;`);
    const updateMany = this.db.transaction(cats => {
      for (const cat of cats) update.run(cat);
    });

    Object.entries(config).forEach(p => {
      const _find = _select.find(sp => sp.key === p[0]);
      if (_find) {
        updateList.push({ id: _find.id, value: p[1] });
      } else {
        insertList.push({
          id: v4(),
          createTime: +new Date(),
          updateTime: +new Date(),
          key: p[0],
          value: p[1]?.toString(),
          type: p[1] === undefined ? 'string' : typeof p[1],
        });
      }
    });
    updateList.length > 0 && !init && updateMany(updateList);
    insertList.length > 0 && insertMany(insertList);
  }

  /** 填充项目ID及磅房ID */
  static joinParam(tableName: string, obj: any, info?: { proId: string; poundId: string }) {
    if (this.joinProid.indexOf(tableName) !== -1 && !obj.proId) {
      const bindInfo = info || this.getBindPoundInfo();
      obj.proId = bindInfo.proId ?? '';
    } else if (this.joinPoundId.indexOf(tableName) !== -1 && !obj.proId) {
      const bindInfo = info || this.getBindPoundInfo();
      obj.proId = bindInfo.proId ?? '';
      obj.poundId = bindInfo.id ?? '';
    }
  }

  /** 捅过对象插入数据 */
  static insertFromObj<T = Record<string, any>>(
    tableName: string,
    obj: T & {
      id?: string;
      createTime?: number;
      updateTime?: number;
      proId?: string;
      poundId?: string;
    },
  ) {
    /** 固定字段 id 和createTime 如果没有就填充进去 */
    if (!obj.id) {
      obj.id = v4();
    }
    if (!obj.createTime) {
      obj.createTime = +new Date();
    }
    if (!obj.updateTime) {
      obj.updateTime = +new Date();
    }
    this.joinParam(tableName, obj);

    const keys: string[] = [];
    const values: any[] = [];
    for (const key in obj) {
      const element = (obj as any)[key];
      keys.push(key);
      values.push(element);
    }
    const strSql = `insert into ${tableName}(${keys.join(',')}) values(${keys.map(() => '?').join(',')})`;
    this.db.prepare(strSql).run(...values);
  }

  /** 获取需要同步的数据 */
  static syncGetData(tableName: string) {
    let all: unknown[] = [];
    if (this.hasAsyncTable.indexOf(tableName) !== -1) {
      const bindInfo = this.getBindPoundInfo();
      // 为防止数据量过多，每次最多查询900条未同步的数据
      if (this.joinProid.indexOf(tableName) !== -1) {
        all = this.db
          .prepare(`select * from ${tableName} where proId='${bindInfo.proId}' and async=? limit 900`)
          .all(SyncType.NOT_SYNC);
      } else {
        all = this.db
          .prepare(
            `select * from ${tableName} where proId='${bindInfo.proId}' and poundId='${bindInfo.id}' and async=? limit 900`,
          )
          .all(SyncType.NOT_SYNC);
      }
    }
    return { data: all };
  }

  static syncInsertData<T = Record<string, any>>(
    tableName: string,
    objs: (T & { id: string; proId: string; poundId?: string })[],
  ) {
    if (objs.length === 0) return;
    if (this.joinProid.indexOf(tableName) !== -1 && !objs[0].proId) {
      const bindInfo = this.getBindPoundInfo();
      objs.forEach(item => {
        item.proId = bindInfo.proId ?? '';
      });
    } else if (this.joinPoundId.indexOf(tableName) !== -1 && !objs[0].proId) {
      const bindInfo = this.getBindPoundInfo();
      objs.forEach(item => {
        item.proId = bindInfo.proId ?? '';
        item.poundId = bindInfo.id ?? '';
      });
    }
    const entries = Object.entries(objs[0]);
    const insert = this.db.prepare(
      `insert into ${tableName}(${entries
        .map(p => p[0])
        .join(',')}) values(${entries.map(p => '@' + p[0]).join(',')});`,
    );

    this.db.exec('BEGIN TRANSACTION;'); // 手动开启事务
    // 为防止后台初始化同步，一次同步的数据过多，需拆分数据进行分批插入数据库
    const pageSize = 1000; // 每次最多插入1000条数据
    const totalNum = Math.ceil(objs.length / pageSize);
    for (let i = 0; i < totalNum; i++) {
      const insertData = objs.slice(i * pageSize, (i + 1) * pageSize);
      try {
        /// 先删除 调用事务
        const tran = this.db.transaction(_list => {
          /**直接删除 */
          this.deleteById(tableName, insertData.map(p => p.id).join(','));
          for (const cat of _list) insert.run(cat);
        });
        tran(insertData);
      } catch (error) {
        console.log('sync insert error:', error);
      }
    }
    this.db.exec('COMMIT;'); // 等到 COMMIT 命令才会执行磁盘IO的读写
  }

  /** 通过ID修改数据 */
  static updateFromObj<T = Record<string, any>>(
    tableName: string,
    obj: T & { updateTime?: number; id?: string; createTime?: number },
  ) {
    const keys: string[] = [];
    const values: any[] = [];
    if (!obj.id) {
      throw new Error('请传入需要修改的ID');
    }
    obj.updateTime = +new Date();
    // this.joinParam(tableName, obj);
    for (const key in obj) {
      const element = (obj as any)[key];
      keys.push(key);
      values.push(element);
    }
    const strSql = `update ${tableName} set ${keys.map(p => p + '=?').join(',')} where id=?`;
    values.push(obj.id);
    this.db.prepare(strSql).run(...values);
  }

  /** 根据ID删除 如果有根据其他删除请自行写sql */
  static deleteById(tableName: string, ids: string) {
    if (!ids) {
      throw new Error('请传入条件');
    }
    const strSql = `delete from ${tableName} where id in(${ids
      .split(',')
      .map(() => '?')
      .join(',')})`;
    console.log('删除', strSql);
    this.db.prepare(strSql).run(...ids.split(','));
  }

  static buildWhere(condition: ISqliteWhereBuildFileds | Record<string, any>): {
    strSql: string;
    params: any[];
  } {
    if (condition.fileds && condition.fileds) {
      return {
        strSql: ` (${condition.fileds} ${condition.type || '='} ?) `,
        params: [condition.fileds],
      };
    } else if (condition.children) {
      const params: any[] = [];
      const strSql: string[] = [];
      condition.children.forEach((element: ISqliteWhereBuildFileds) => {
        const result = this.buildWhere(element);
        params.push(...result.params);
        strSql.push(result.strSql);
      });
      return { strSql: ` ${strSql.join(condition.condition)} `, params };
    } else {
      const params: any[] = [];
      const _list: string[] = [];
      Object.entries(condition).forEach(p => {
        _list.push(`${p[0]}=?`);
        params.push(p[1]);
      });
      return { strSql: ` (${_list.join(' and ')}) `, params };
    }
  }

  /** 分页查询 */
  static selectByPage<T = any>(
    tableName: string,
    options: {
      strSql?: string;
      pageNum?: number;
      pageSize?: number;
      where?: string;
      whereFileds?: any[];
      order?: string;
      orderByCreateTime?: boolean;
      tableAs?: string;
      buildWhere?: ISqliteWhereBuildFileds | Record<string, any>;
      countSql?: string;
    },
  ): { total: number; list: T[] } {
    const { pageSize = 10, tableAs = '', orderByCreateTime = true } = options ?? {};
    let { pageNum = 1, whereFileds = [], where = '', order = '' } = options ?? {};
    where && (where = ' where ' + where);

    if (options.buildWhere) {
      const build = this.buildWhere(options.buildWhere);
      if (build.params.length !== 0) {
        where = ` where ${build.strSql} `;
        whereFileds = build.params;
      }
    }
    const bindInfo = this.getBindPoundInfo();
    if (this.joinPoundId.indexOf(tableName) !== -1) {
      if (where) {
        where += ` and proId='${bindInfo.proId}' and poundId='${bindInfo.id}' `;
      } else {
        where = ` where proId='${bindInfo.proId}' and poundId='${bindInfo.id}' `;
      }
    } else if (this.joinProid.indexOf(tableName) !== -1) {
      if (where) {
        where += ` and proId='${bindInfo.proId}' `;
      } else {
        where = ` where proId='${bindInfo.proId}' `;
      }
    }

    !order && orderByCreateTime && (order = ' order by createTime desc');
    pageNum = (pageNum - 1) * pageSize;
    const strSql = options.strSql
      ? `${options.strSql}  limit ${pageSize} offset ${pageNum} `
      : `select * from ${tableName} ${where} ${order} limit ${pageSize} offset ${pageNum};`;
    const strSqlCount = options.countSql
      ? options.countSql
      : `select count(1) from ${tableName} ${tableAs && ' as ' + tableAs} ${where}`;
    return {
      total: (this.db.prepare(strSqlCount).get(...whereFileds) as any)['count(1)'],
      list: this.db.prepare(strSql).all(...whereFileds) as any,
    };
  }

  /** 写入版本号 */
  static updateVersion(version: number) {
    this.db.prepare(`DELETE from t_config where key='${EDBConfigkey.VERSION.toString()}'`).run();
    this.insertFromObj('t_config', {
      key: EDBConfigkey.VERSION.toString(),
      value: version.toString(),
      type: 'number',
    });
  }

  /** 升级数据库 */
  static upgradeDB() {
    const version = this.getVersion();
    if (!version) {
      this.updateVersion(this.version);
    } else if (SqliteUtil.version > +version) {
      // 如果 版本号不一样，执行数据库版本更新程序
      this.upgradeDBFunc[version + 1]?.();
      this.updateVersion(version + 1);
      this.upgradeDB();
    }
  }

  /** 一级一级的升级数据库的方法，防止错乱 */
  static upgradeDBFunc: Record<number, () => void> = {
    2: () => {
      this.upgradeBySqlCmd(2);
    },
  };

  /** 升级的时候执行sql */
  static upgradeBySqlCmd(version: number | string) {
    const str: string = require(`./sqlUpgrradeCmd/v_${version}`).default;
    this.db.exec(str);
  }
}
