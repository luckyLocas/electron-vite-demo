import { memo, useState } from 'react';
import ProLayout from '@ant-design/pro-layout';
import Footer from './footer';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import configRoute from '@src/route';
import logo from '@src/assets/logo.png';

/**
 * 整体布局
 */
const Layout = memo(() => {
  const navigate = useNavigate();
  const [pathname, setPathname] = useState('/home');

  const location = useLocation();
  console.log('location', pathname, location);

  return (
    <ProLayout
      title="后台管理系统"
      navTheme="light"
      logo={<img src={logo} alt="logo" />}
      route={configRoute}
      style={{ width: '100vw', height: '100vh' }}
      waterMarkProps={{
        content: '朗道物料管理系统',
      }}
      location={{
        pathname,
      }}
      layout="top"
      menuItemRender={(item, dom) => {
        return (
          <div
            role="presentation"
            onClick={() => {
              console.log('item', item, navigate);
              navigate(item.path || '/home');
              setPathname(item.path || '/home');
            }}>
            {dom}
          </div>
        );
      }}
      fixSiderbar
      fixedHeader
      rightContentRender={() => <Link to="/login">退出</Link>}
      footerRender={() => <Footer />}>
      <Outlet />
    </ProLayout>
  );
});

export default Layout;
