import React from 'react';
import { observer } from 'mobx-react-lite';

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
    initedRoom,
    initedLogs,
  } = store;

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
