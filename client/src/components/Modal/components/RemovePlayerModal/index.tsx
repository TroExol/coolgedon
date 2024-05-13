import type { FC } from 'react';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { ws } from 'Service/ws';
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

  const removePlayer = () => {
    modalsStore.close();
    ws.sendMessage({ event: EEventTypes.removePlayer, data: { nickname } });
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
