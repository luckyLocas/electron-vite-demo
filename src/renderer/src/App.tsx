import './global.less';

import { JSX } from 'react/jsx-runtime';
import Layout from './layout';
import { Route, Routes, HashRouter } from 'react-router-dom';
import Login from './pages/login';
import configRoute, { IRoute } from './route';
import { Suspense, useMemo } from 'react';

// 将树形路由解析成一维数组形式用于构成 Route 路由  此处可以控制有权限的路由显示出来
const flatRoute = (routes: IRoute[], rs: IRoute[]): void => {
  routes.map(el => {
    if (el.routes && el.routes.length > 0) {
      return flatRoute(el.routes, rs);
    } else {
      rs.push(el);
    }
  });
};
/**
 * 解析路由
 * @param {IRoute[]} routes
 * @return {*}  {JSX.Element}
 */
const parseRoute = (routes: IRoute[]): JSX.Element => {
  return (
    <>
      {routes.map(({ path, component, ...routes }) => (
        <Route path={path} key={path} element={component} {...routes} />
      ))}
    </>
  );
};

function App(): JSX.Element {
  const routes = useMemo(() => {
    const iRoutes: IRoute[] = [];
    if (configRoute) {
      flatRoute(configRoute.routes || [], iRoutes);
      const r = parseRoute(iRoutes);
      return r;
    }
    return null;
  }, [configRoute]);

  return (
    <HashRouter>
      <Suspense fallback={<div>loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            {routes}
          </Route>
          <Route path="*" element={<div>page404，页面找不到了...</div>} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
export default App;
