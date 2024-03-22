import { Button } from 'antd';
import './index.less';

import React from 'react';

interface IPageContentProps {
  children: React.ReactNode;
  /** 是否显示标题 */
  title?: string | false;
  /** 是否有返回按钮 */
  back?: boolean;
}

const PageContent: React.FC<IPageContentProps> = props => {
  const { children, title = false, back = false } = props;
  return (
    <div className="mainPageWrapper">
      {title && !back ? <div className="pageTitle">{title}</div> : null}
      {title && back ? (
        <div
          style={{
            display: 'flex',
          }}>
          <div
            className="pageTitle"
            style={{
              flex: 1,
            }}>
            {title}
          </div>
          <Button
            onClick={() => {
              window.history.back();
            }}>
            返回
          </Button>
        </div>
      ) : null}
      {children}
    </div>
  );
};

export default PageContent;
