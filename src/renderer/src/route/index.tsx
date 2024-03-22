import { BarsOutlined, HomeOutlined } from '@ant-design/icons';
import TablePage from '@src/pages/table';
import { lazy } from 'react';

const HomePage = lazy(() => import('@src/pages/home'));

export interface IRoute {
  path: string;
  name?: string;
  // 菜单icon
  icon?: React.ReactNode;
  component?: JSX.Element;
  routes?: IRoute[];
  hideInMenu?: boolean;
  // 禁用路由权限验证
  disableVaildAuth?: boolean;
}

const configRoute: IRoute = {
  path: '/',
  routes: [
    {
      path: '/home',
      name: '首页',
      icon: <HomeOutlined />,
      component: <HomePage />,
    },
    {
      path: '/table',
      name: '列表页',
      icon: <BarsOutlined />,
      component: <TablePage />,
    },
  ],
};

export default configRoute;
