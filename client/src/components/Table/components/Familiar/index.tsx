import type { FC } from 'react';

import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'framer-motion';
import { services } from 'Service';
import { EEventTypes } from '@coolgedon/shared';

import { store } from 'Store';
import { useHeartBeatAnimation } from 'Hook/useHeartBeatAnimation';
import { CardsModal } from 'Component/Modal/components/CardsModal';
import { BuyCardModal } from 'Component/Modal/components/BuyCardModal';
import { Card } from 'Component/Card';

export const Familiar: FC = observer(() => {
  const {
    modalsStore,
    roomStore,
    previewStore,
  } = store;
  const { roomNamespace } = services;

  const { familiarToBuy } = roomStore.activePlayer;
  const isMe = roomStore.isMe(roomStore.activePlayer);
  const controls = useHeartBeatAnimation(familiarToBuy?.id);

  const onClick = useCallback(() => {
    if (!familiarToBuy) {
      return;
    }
    if (modalsStore.modals.length) {
      previewStore.show(<CardsModal
        cards={[familiarToBuy]}
        title={isMe
          ? 'Твой фамильяр'
          : `Фамильяр игрока ${roomStore.activePlayer.nickname}`}
      />);
      return;
    }
    const onBuyClick = () => {
      modalsStore.close();
      roomNamespace.socket.emit(EEventTypes.buyFamiliarCard);
    };
    modalsStore.show(<BuyCardModal
      card={familiarToBuy}
      onClick={onBuyClick}
    />);
  }, [familiarToBuy, isMe, modalsStore, roomStore.activePlayer.nickname, previewStore]);

  return familiarToBuy && (
    <motion.div animate={controls}>
      <Card
        disabled={!isMe
          || (roomStore.activePlayer?.totalPower || 0) < (familiarToBuy.totalCost || 999)}
        number={familiarToBuy.number}
        onClick={onClick}
        title="Фамильяр"
        type={familiarToBuy.type}
      />
    </motion.div>
  );
});
