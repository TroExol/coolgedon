import type { FC } from 'react';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { AnimatePresence, motion } from 'framer-motion';
import { services } from 'Service';
import { EEventTypes, type TCard } from '@coolgedon/shared';

import { store } from 'Store';
import { useHeartBeatAnimation } from 'Hook/useHeartBeatAnimation';
import { PlayCardModal } from 'Component/Modal/components/PlayCardModal';
import { CardsModal } from 'Component/Modal/components/CardsModal';
import { Card } from 'Component/Card';

import styles from './Control.module.css';

export const Control: FC = observer(() => {
  const {
    roomStore,
    modalsStore,
    previewStore,
  } = store;
  const { roomNamespace } = services;

  const onPlayCardClick = (card: TCard) => {
    if (!card) {
      return;
    }
    if (modalsStore.modals.length) {
      previewStore.show(<CardsModal
        cards={[card]}
        title="Карта контроля"
      />);
      return;
    }

    if (card.canPlay && !roomStore.gameEnded && roomStore.isActive(roomStore.me)) {
      const onPlayClick = () => {
        modalsStore.close();
        roomNamespace.socket.emit(EEventTypes.playCard, card);
      };
      modalsStore.show(<PlayCardModal
        card={card}
        onConfirm={onPlayClick}
      />);
      return;
    }

    modalsStore.show(<CardsModal
      cards={[card]}
      title="Карта контроля"
    />);
  };

  const controls = useHeartBeatAnimation(roomStore.activePlayer.totalPower);

  return (
    <div>
      <h3 className={styles.title}>
        Контроль&nbsp;
        {roomStore.activePlayer.nickname}
        {' '}
        <motion.span
          animate={controls}
          style={{ display: 'inline-block' }}
        >
          (Мощь:&nbsp;
          {roomStore.activePlayer.totalPower}
          )
        </motion.span>
      </h3>
      <div className={styles.cards}>
        <AnimatePresence
          initial={false}
          mode="popLayout"
        >
          {roomStore.activePlayer.hand?.map(card => (
            <motion.div
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              initial={{ y: 100, opacity: 0 }}
              key={card.id}
            >
              <Card
                disabled={!card.canPlay}
                number={card.number}
                onClick={() => onPlayCardClick(card)}
                type={card.type}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
});
