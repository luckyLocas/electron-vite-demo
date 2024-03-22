import './index.less';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Login = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="login-container">
      <div className="login-form">
        <h2 style={{ textAlign: 'center' }}>系统登录</h2>
        <ProForm
          title="登录"
          submitter={{
            searchConfig: { submitText: '登录' },
          }}
          onFinish={async () => {
            navigate('/home');
          }}>
          <ProFormText
            name="username"
            label="用户名"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined className="prefixIcon" />,
            }}
            placeholder="用户名"
            rules={[
              {
                required: true,
                message: '请输入用户名!',
              },
            ]}
          />
          <ProFormText.Password
            label="密码"
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className="prefixIcon" />,
            }}
            placeholder="密码"
            rules={[
              {
                required: true,
                message: '请输入密码！',
              },
            ]}
          />
        </ProForm>
      </div>
    </div>
  );
};

export default Login;
