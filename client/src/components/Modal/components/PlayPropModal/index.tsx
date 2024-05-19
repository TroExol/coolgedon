import type { FC, MouseEventHandler } from 'react';
import type { TProp } from '@coolgedon/shared';

import React from 'react';
import { observer } from 'mobx-react-lite';

import { store } from 'Store';
import { Prop } from 'Component/Prop';
import { Button } from 'Component/Button';

import styles from './PlayPropModal.module.css';

interface TProps {
  prop: TProp;
  onConfirm: MouseEventHandler;
}

export const PlayPropModal: FC<TProps> = observer(({
  prop,
  onConfirm,
}) => {
  const { roomStore } = store;

  return (
    <div className={styles.container}>
      <Prop
        big
        prop={prop}
      />
      {!roomStore.gameEnded && roomStore.playersArray.length > 1 && (
        <Button
          className={styles.button}
          onClick={onConfirm}
        >
          Разыграть
        </Button>
      )}
    </div>
  );
});
