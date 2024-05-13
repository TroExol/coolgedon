import type { FC } from 'react';

import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { AnimatePresence, motion } from 'framer-motion';

import { store } from 'Store';
import { onEnter } from 'Helpers';
import { LogsModal } from 'Component/Modal/components/LogsModal';

import styles from './Logs.module.css';

export const Logs: FC = observer(() => {
  const $container = useRef<HTMLDivElement>(null);
  const [firstView, setFirstView] = useState(true);
  const { logsStore, previewStore } = store;

  const onShowLogs = () => {
    previewStore.show(<LogsModal />);
  };

  useEffect(() => {
    if (!$container.current) {
      return;
    }
    const { offsetHeight, scrollHeight, scrollTop } = $container.current as HTMLDivElement;
    if (firstView) {
      $container.current.scrollTo(0, scrollHeight);
      setFirstView(false);
    } else if (scrollHeight <= scrollTop + offsetHeight + 300) {
      $container.current.scrollTo(0, scrollHeight);
    }
  }, [logsStore, $container, firstView]);

  return (
    <div
      className={styles.container}
      onClick={onShowLogs}
      onKeyDown={onEnter(onShowLogs)}
      ref={$container}
      role="button"
      tabIndex={0}
    >
      <AnimatePresence>
        {logsStore.logs.map(log => (
          <motion.p
            animate={{ transform: 'translateX(0)' }}
            className={styles.log}
            exit={{ transform: 'translateX(-100px)' }}
            initial={{ transform: 'translateX(-100px)' }}
            key={log.id}
          >
            <span className={styles.time}>
              {new Date(log.date).toLocaleString()}
            </span>
            <span>{log.msg}</span>
          </motion.p>
        ))}
      </AnimatePresence>
    </div>
  );
});
