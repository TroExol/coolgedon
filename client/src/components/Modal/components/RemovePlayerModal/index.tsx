import type { FC } from 'react';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { services } from 'Service';
import { EEventTypes } from '@coolgedon/shared';

import { store } from 'Store';
import { Button } from 'Component/Button';

import styles from './RemovePlayerModal.module.css';

interface TProps {
  nickname: string;
}

export const RemovePlayerModal: FC<TProps> = observer(({
  nickname,
}) => {
  const { modalsStore } = store;
  const { roomNamespace } = services;

  const removePlayer = () => {
    modalsStore.close();
    roomNamespace.socket.emit(EEventTypes.removePlayer, nickname);
  };

  return (
    <div>
      <h3>
        Вы действительно хотите изгнать игрока
        {' '}
        {nickname}
        ?
      </h3>
      <Button
        className={styles.button}
        onClick={removePlayer}
      >
        Безусловно
      </Button>
    </div>
  );
});
