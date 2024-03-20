import Route from 'koa-router';
import ApiResult from './apiResult';

const CompanyRoute = new Route({
  prefix: '/api/company',
});

CompanyRoute.post('/page', ctx => {
  const body = ctx.request.body;
  console.log('request body', body);

  ctx.body = ApiResult.success([]);
});

export default CompanyRoute;
