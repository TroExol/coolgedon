import type { FC } from 'react';

import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { AnimatePresence, motion } from 'framer-motion';
import { services } from 'Service';
import { EEventTypes, type TCard } from '@coolgedon/shared';

import { store } from 'Store';
import { CardsModal } from 'Component/Modal/components/CardsModal';
import { BuyCardModal } from 'Component/Modal/components/BuyCardModal';
import { Card } from 'Component/Card';

import styles from './FleaMarket.module.css';

export const FleaMarket: FC = observer(() => {
  const {
    roomStore,
    modalsStore,
    previewStore,
  } = store;
  const { roomNamespace } = services;

  const isActiveMe = roomStore.isActive(roomStore.me);

  const onClick = useCallback((card: TCard) => {
    if (!card) {
      return;
    }
    if (modalsStore.modals.length) {
      previewStore.show(<CardsModal
        cards={[card]}
        title="Карта барахолки"
      />);
      return;
    }
    const onBuyClick = () => {
      modalsStore.close();
      roomNamespace.socket.emit(EEventTypes.buyShopCard, card);
    };
    modalsStore.show(<BuyCardModal
      card={card}
      onClick={onBuyClick}
    />);
  }, [modalsStore, previewStore]);

  return (
    <div className={styles.container}>
      <AnimatePresence
        initial={false}
        mode="popLayout"
      >
        {roomStore.shop.map(card => (
          <motion.div
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            initial={{ y: 100, opacity: 0 }}
            key={card.id}
          >
            <Card
              disabled={!isActiveMe || (roomStore.activePlayer.totalPower || 0) < (card.totalCost || 999)}
              number={card.number}
              onClick={() => onClick(card)}
              type={card.type}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});
