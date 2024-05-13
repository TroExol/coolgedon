import type { FC } from 'react';

import React from 'react';
import { observer } from 'mobx-react-lite';

import { store } from 'Store';

import styles from './LogsModal.module.css';

export const LogsModal: FC = observer(() => {
  const { logsStore } = store;

  return (
    <div className={styles.container}>
      {logsStore.logs.map((log, index) => (
        <p
          className={styles.log}
          // eslint-disable-next-line react/no-array-index-key
          key={`${log.date}_${index}`}
        >
          <span className={styles.time}>
            {log.date}
            {' '}
            МСК
          </span>
          <span>{log.msg}</span>
        </p>
      ))}
    </div>
  );
});
