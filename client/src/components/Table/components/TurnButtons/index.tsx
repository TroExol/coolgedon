import type { FC } from 'react';

import React, {
  useCallback, useEffect, useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import { AnimatePresence, motion } from 'framer-motion';
import { services } from 'Service';
import { EEventTypes } from '@coolgedon/shared';

import { store } from 'Store';
import { Button } from 'Component/Button';

import styles from './TurnButtons.module.css';

export const TurnButtons: FC = observer(() => {
  const { roomStore, modalsStore } = store;
  const { roomNamespace } = services;

  const [loadingNextTurn, setLoadingNextTurn] = useState(false);
  const isActiveMe = roomStore.isActive(roomStore.me);

  const endTurn = useCallback(() => {
    if (modalsStore.modals.length) {
      return;
    }
    setLoadingNextTurn(true);
    roomNamespace.socket.emit(EEventTypes.endTurn);
  }, [modalsStore.modals.length]);

  const playAllCards = useCallback(() => {
    if (!roomStore.activePlayer.hand?.length) {
      return;
    }
    roomNamespace.socket.emit(EEventTypes.playAllCards);
  }, [roomStore.activePlayer.hand?.length]);

  useEffect(() => {
    setLoadingNextTurn(false);
  }, [isActiveMe]);

  return (
    <AnimatePresence initial={false}>
      {!roomStore.gameEnded && isActiveMe && !loadingNextTurn && roomStore.playersArray.length > 1 && (
        <motion.div
          animate={{ opacity: 1 }}
          className={styles.container}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <Button onClick={endTurn}>
            Закончить ход
          </Button>
          {roomStore.activePlayer.hand?.some(({ canPlay }) => canPlay)
            && (
              <Button onClick={playAllCards}>
                Разыграть все
              </Button>
            )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
