import Koa from 'koa';
import BodyParser from 'koa-bodyparser';
import CompanyRoute from './companyRoute';
import ApiResult from './apiResult';
import staticResource from 'koa-static';
import { join } from 'path';

/**
 * 使用Koa模拟请求接口处理用户操作
 */
class MockKoaApi {
  constructor() {
    const bodyparser = BodyParser();
    const handler = async (ctx, next): Promise<void> => {
      try {
        await next();
      } catch (err) {
        ctx.response.status = 200;
        if (err instanceof Error) {
          ctx.response.body = ApiResult.errorMsg(err.message ?? '未知错误');
        } else {
          ctx.response.body = ApiResult.errorMsg('未知错误');
        }
      }
    };
    const app = new Koa();
    console.log('index', join(__dirname, '../renderer/index.html'));

    app.use(staticResource(join(__dirname, '../renderer'), { index: 'index.html' }));

    app.use(handler);
    app.use(bodyparser);
    app.use(CompanyRoute.routes());
    app.listen(6688, () => {
      console.log('MockKoaApi start at port 6688');
    });
  }
}

export default MockKoaApi;
