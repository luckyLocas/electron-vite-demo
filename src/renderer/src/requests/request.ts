import { message } from 'antd';
import Axios, { AxiosInstance, AxiosRequestConfig, Method } from 'axios';

export interface IApiConfig extends AxiosRequestConfig {
  errorTips?: boolean;
  successTips?: boolean | string;
}

/** 返回值类型 */
enum EDataType {
  DEFAULT = 0,
  BOOLEAN = 1,
  ONLY_DATA = 2,
  /** 返回值为列表分页类型的数据 */
  PAGE_LIST = 3,
}

export interface IPageList {
  data: never[];
  total: number;
}

/**
 * 通用http请求实体类
 */
class Request {
  private instance: AxiosInstance;
  private options;
  private token = '';

  constructor(config?: IApiConfig) {
    this.instance = this.init(config);
  }

  public init(config: IApiConfig = {}): AxiosInstance {
    this.options = config ?? {};
    this.instance = Axios.create({
      // baseURL: '/' + import.meta.env.MODE,
      baseURL: '/',
      timeout: 8000,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        client: 'web',
        accessToken: this.token,
      },
      ...config,
    });
    this.instance.interceptors.request.use(options => {
      return options;
    });

    this.instance.interceptors.response.use(
      options => {
        return options;
      },
      err => {
        return {
          error: JSON.stringify(err),
        };
      },
    );
    return this.instance;
  }

  public setToken(token: string): void {
    this.token = token;
    this.init(this.options);
  }

  public static getInstance(config?: IApiConfig): Request {
    return new Request(config);
  }

  /**
   * 统一的请求入口，便于集中处理数据
   * 所有的post、get、put请求都走这里
   */
  public request<T>(
    url: string,
    params = {},
    config: IApiConfig = {},
    method: Method = 'POST',
    response: EDataType = EDataType.ONLY_DATA,
  ): Promise<T> {
    let result;
    switch (method) {
      case 'GET':
        result = this.instance.get(url, config);
        break;
      case 'PUT':
        result = this.instance.put(url, params, config);
        break;
      case 'DELETE':
        result = this.instance.delete(url, config);
        break;
      default:
        result = this.instance.post(url, params, config);
        break;
    }
    return new Promise((resole, rejects) => {
      result
        .then(res => {
          let newData;
          const { data } = res?.data ?? {};
          console.log('啊哈哈哈', res);
          if (res?.data?.code !== 10000 && res?.data?.msg) {
            message.error(res?.data?.msg);
          }
          if (res?.error) {
            const err = JSON.parse(res?.error);
            message.error(err?.message || '请求失败');
          }

          switch (response) {
            case EDataType.BOOLEAN:
              newData = true;
              break;
            case EDataType.ONLY_DATA:
              newData = data;
              break;
            case EDataType.PAGE_LIST:
              newData = {
                data: data?.list || [],
                total: data?.list?.length || 0,
                success: true,
              };
              break;
            default:
              newData = res;
              break;
          }
          resole(newData);
        })
        .catch(error => {
          console.log('啊哈哈哈111', error);

          let newData;
          switch (response) {
            case EDataType.BOOLEAN:
              newData = false;
              break;
            case EDataType.ONLY_DATA:
              newData = null;
              break;
            case EDataType.PAGE_LIST:
              newData = {
                data: [],
                total: 0,
                success: true,
              };
              break;
            default:
              newData = error;
              break;
          }
          rejects(newData);
        });
    });
  }

  public post(url: string, params = {}, config?: IApiConfig): Promise<unknown> {
    return this.request(url, params, config);
  }

  public get(url: string, params = {}, config?: IApiConfig): Promise<unknown> {
    return this.request(url, params, config, 'GET');
  }

  public pagingRequest(url: string, params = {}, config?: IApiConfig): Promise<IPageList> {
    return this.request<IPageList>(url, params, config, 'POST', EDataType.PAGE_LIST);
  }

  public booleanRequest(url: string, params = {}, config?: IApiConfig, method?: Method): Promise<boolean> {
    return this.request<boolean>(url, params, config, method, EDataType.BOOLEAN);
  }

  public getAllResponse(url: string, params = {}, config?: IApiConfig, method?: Method): Promise<unknown> {
    return this.request(url, params, config, method, EDataType.DEFAULT);
  }
}

const HttpRequest = Request.getInstance();
export default HttpRequest;
