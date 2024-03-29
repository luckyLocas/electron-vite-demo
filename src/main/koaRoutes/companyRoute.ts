import Route from 'koa-router';
import ApiResult from './apiResult';
import SqliteUtil from '../sqliteUtil';
import { IDBConfigGen } from '../sqliteUtil/DBInsterface/DBConfig';

const CompanyRoute = new Route({
  prefix: '/api/company',
});

CompanyRoute.post('/page', ctx => {
  const body = ctx.request.body || {};
  console.log('request body', body);
  const result = SqliteUtil.selectByPage(IDBConfigGen.tableName, {
    ...body,
    buildWhere: SqliteUtil.objectPmitPage(body),
  });
  ctx.body = ApiResult.success(result);
});

export default CompanyRoute;
