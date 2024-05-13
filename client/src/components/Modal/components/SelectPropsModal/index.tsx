import type { FC } from 'react';
import type { TProp } from '@coolgedon/shared';

import React from 'react';
import { observer } from 'mobx-react-lite';

import { Prop } from 'Component/Prop';
import stylesModal from 'Component/Modal/Modal.module.css';

import styles from './SelectPropsModal.module.css';

interface TProps {
  props: TProp[];
  title?: string;
  selectedProps: TProp[];
  onClick?: (card: TProp) => void;
}

export const SelectPropsModal: FC<TProps> = observer(({
  props,
  selectedProps,
  title,
  onClick,
}) => {
  const bordered = (prop: TProp) => selectedProps.includes(prop);

  return (
    <div>
      {title && (<h3 className={stylesModal.title}>{title}</h3>)}
      <div className={styles.container}>
        {props.map(prop => (
          <Prop
            big
            bordered={bordered(prop)}
            key={prop.id}
            onClick={() => onClick?.(prop)}
            prop={prop}
          />
        ))}
      </div>
    </div>
  );
});
