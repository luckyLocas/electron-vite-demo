import './index.less';

import { JSX } from 'react/jsx-runtime';
import HttpRequest from '@src/requests/request';
import { useEffect } from 'react';

function Home(): JSX.Element {
  console.log(import.meta.env.MODE, import.meta.env.MAIN_VITE_KEY, import.meta.env.RENDERER_VITE_KEY);
  useEffect(() => {
    getData();
  }, []);

  const getData = async (): Promise<void> => {
    const res = await HttpRequest.post('/api/company/page');
    console.log('res', res);
  };

  return (
    <div className="home-page">
      <div className="welcome-section">
        <h1 className="animate__animated animate__pulse">欢迎来到未来科技</h1>
        <p className="animate__animated animate__pulse">探索最前沿的创新</p>
      </div>
      <div className="content-card">
        <div className="card left">卡片1</div>
        <div className="card left">卡片2</div>
        <div className="card right">卡片3</div>
        <div className="card right">卡片4</div>
      </div>
    </div>
  );
}

export default Home;
