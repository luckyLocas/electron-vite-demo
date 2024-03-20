import React from 'react';

/**
 *  自定义图标 阿里图标库改了，新生成的地址，都不可以生产环境使用
 *  旧版本路径前缀为 //at.alicdn.com/t/  可以生产环境使用
 *  新版本路径前缀为 //at.alicdn.com/t/c/  不可以生产环境使用
 */
// const JadIcon = createFromIconfontCN({
//   scriptUrl: [
//     '//oss.jadinec.com/iconfont/bhz/font_2587049_cw77tlp4al/iconfont.js',
//   ],
// });
// export default JadIcon;

type IJadIconProps = {
  value: string;
  color?: string;
  prefix?: string;
  className?: string;
  size?: number | string;
  onClick?: () => void;
};

class JadIcon extends React.PureComponent<IJadIconProps, unknown> {
  render(): React.ReactElement {
    const { size = 14, className = '', value, color, prefix, onClick } = this.props;
    return (
      <div
        role="presentation"
        onClick={e => {
          e.stopPropagation();
          if (onClick) {
            onClick();
          }
        }}
        className={`${prefix || 'iconfont'} ${className} ${value}`}
        style={{
          display: 'inline-block',
          minWidth: size === '20' ? '23px' : 'auto',
          marginRight: '6px',
          verticalAlign: 'bottom',
          fontSize: size + 'px',
          color,
        }}
      />
    );
  }
}

export default JadIcon;
