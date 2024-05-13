import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ws } from 'Service/ws';
import { EEventTypes } from '@coolgedon/shared';

import { store } from 'Store';
import { Table } from 'Component/Table';
import { RoomUtilButtons } from 'Component/RoomUtilButtons';
import { Preview } from 'Component/Preview';
import { Players } from 'Component/Players';
import { Modal } from 'Component/Modal';
import { Logs } from 'Component/Logs';

import styles from './Game.module.css';

export const Game = observer(() => {
  const {
    roomStore,
    initedRoom,
    initedLogs,
  } = store;

  useEffect(() => {
    const onCloseWindow = () => {
      if (!initedRoom) {
        return;
      }
      ws.sendMessage({
        event: EEventTypes.disconnect,
        data: { nickname: roomStore.myNickname },
      });
    };
    window.addEventListener('beforeunload', onCloseWindow);

    return () => window.removeEventListener('beforeunload', onCloseWindow);
  }, [initedRoom, roomStore, roomStore?.myNickname]);

  return (
    <>
      <div id="game">
        {initedLogs && (
        <Logs />
        )}
        <div className={styles.container}>
          {initedRoom && (
            <>
              <Table />
              <Players />
              <RoomUtilButtons />
            </>
          )}
        </div>
      </div>
      <Modal />
      <Preview />
    </>
  );
});
