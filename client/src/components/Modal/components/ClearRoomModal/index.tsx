import type { FC } from 'react';

import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { ws } from 'Service/ws';
import { EEventTypes } from '@coolgedon/shared';

import { store } from 'Store';
import { Button } from 'Component/Button';

import styles from './ClearRoomModal.module.css';

export const ClearRoomModal: FC = observer(() => {
  const { modalsStore } = store;

  const onClick = useCallback(() => {
    modalsStore.close();
    ws.sendMessage({ event: EEventTypes.reset });
    window.location.reload();
  }, [modalsStore]);

  return (
    <div>
      <h3>Вы действительно хотите удалить комнату?</h3>
      <Button
        className={styles.button}
        onClick={onClick}
      >
        Удалить
      </Button>
    </div>
  );
});
