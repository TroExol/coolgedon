import type { FC } from 'react';
import type { TProp } from '@coolgedon/shared';

import React from 'react';
import { observer } from 'mobx-react-lite';

import { store } from 'Store';
import { Prop } from 'Component/Prop';
import stylesModal from 'Component/Modal/Modal.module.css';

import styles from './PlayPropsModal.module.css';

interface TProps {
  props: TProp[];
  title?: string;
  onClick: (prop: TProp) => void;
}

export const PlayPropsModal: FC<TProps> = observer(({
  props,
  title,
  onClick,
}) => {
  const { roomStore } = store;

  const disabled = (prop: TProp) => !prop.canPlay || roomStore.gameEnded;

  return (
    <div>
      {title && (<h3 className={stylesModal.title}>{title}</h3>)}
      <div className={styles.container}>
        {props.map(prop => (
          <Prop
            big
            disabled={disabled(prop)}
            key={prop.id}
            onClick={disabled(prop) ? undefined : () => onClick(prop)}
            prop={prop}
          />
        ))}
      </div>
    </div>
  );
});
