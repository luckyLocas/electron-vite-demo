import { Modal, ModalProps } from 'antd';
import React, { ReactElement } from 'react';
import { memo, useMemo, useState } from 'react';

interface IProps extends ModalProps {
  children?: ReactElement;
  trigger: ReactElement;
}

const TriggerModal: React.FC<IProps> = memo(props => {
  const { children, trigger, onOk, ...otherProps } = props;
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const triggerNode = useMemo(() => {
    return React.cloneElement(trigger, {
      onClick: () => {
        setVisible(true);
      },
    });
  }, [trigger]);

  return (
    <>
      {triggerNode}
      <Modal
        visible={visible}
        okButtonProps={{ loading }}
        onCancel={() => setVisible(false)}
        {...otherProps}
        onOk={async e => {
          setLoading(true);
          if (onOk) {
            await onOk(e);
          }
          setVisible(false);
          setLoading(false);
        }}>
        {children}
      </Modal>
    </>
  );
});

export default TriggerModal;
