export interface IApiResult<T> {
  code: 10000 | number;
  data?: T;
  msg: string;
  success: boolean;
}

export default class ApiResult {
  static success<T>(data?: T, msg = '操作成功'): IApiResult<T> {
    return {
      code: 10000,
      data,
      msg,
      success: true,
    };
  }

  static error<T>(_data: T, msg = '操作失败'): IApiResult<T> {
    return {
      code: 500,
      msg,
      success: true,
    };
  }

  static errorMsg<T>(msg = '操作失败'): IApiResult<T> {
    return {
      code: 500,
      msg,
      success: true,
    };
  }
}
