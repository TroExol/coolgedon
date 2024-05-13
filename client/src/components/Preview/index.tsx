import type { FC } from 'react';

import React, { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { AnimatePresence, motion } from 'framer-motion';

import { store } from 'Store';
import { Button } from 'Component/Button';

import styles from './Preview.module.css';

type domElementType = Element & { inert: boolean; };

export const Preview: FC = observer(() => {
  const { previewStore } = store;
  const onEsc = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Escape') {
      return;
    }
    previewStore.close();
  }, [previewStore]);

  useEffect(() => {
    if (previewStore.content) {
      return;
    }
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onEsc, previewStore.content]);

  useEffect(() => {
    if (!previewStore.content) {
      return;
    }
    const $app = document.querySelector('#game') as domElementType;
    const $modal = document.querySelector('#modal') as domElementType;
    if ($app) {
      $app.inert = true;
    }
    if ($modal) {
      $modal.inert = true;
    }
    return () => {
      if ($app) {
        $app.inert = false;
      }
      if ($modal) {
        $modal.inert = false;
      }
    };
  }, [previewStore.content]);

  return (
    <AnimatePresence>
      {store.previewStore.content && (
        <motion.div
          animate={{ opacity: 1 }}
          className={styles.container}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={store.previewStore.close}
          role="banner"
        >
          <div className={styles.content}>
            {store.previewStore.content}
            <Button
              className={styles.button}
              onClick={store.previewStore.close}
            >
              Закрыть
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
