import { ModalForm, ModalFormProps } from '@ant-design/pro-form';
import { memo, useCallback, useState } from 'react';

/**
 * ModalForm组件拓展
 * 添加确认按钮loading状态，防止用户频繁点击重复调用接口
 */
const CModalForm: React.FC<ModalFormProps> = memo(props => {
  const { children, onFinish, modalProps = {}, ...otherProps } = props;
  const [loading, setLoading] = useState(false);

  const finishFun = useCallback(
    async values => {
      if (onFinish && typeof onFinish === 'function') {
        setLoading(true);
        const res = await onFinish(values);
        setLoading(false);
        return res;
      }
      return true;
    },
    [onFinish],
  );

  return (
    <ModalForm {...otherProps} onFinish={finishFun} modalProps={{ ...modalProps, confirmLoading: loading }}>
      {children}
    </ModalForm>
  );
});

export default CModalForm;
