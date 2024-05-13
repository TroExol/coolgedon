import type { FC } from 'react';

import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'framer-motion';
import { ws } from 'Service/ws';
import { ECardTypes, EEventTypes } from '@coolgedon/shared';

import { store } from 'Store';
import { useHeartBeatAnimation } from 'Hook/useHeartBeatAnimation';
import { getLastElement } from 'Helpers';
import { CardsModal } from 'Component/Modal/components/CardsModal';
import { BuyCardModal } from 'Component/Modal/components/BuyCardModal';
import { Card } from 'Component/Card';

export const CrazyMagic: FC = observer(() => {
  const {
    roomStore,
    modalsStore,
    previewStore,
  } = store;

  const isActive = roomStore.isActive(roomStore.me);
  const topCard = getLastElement(roomStore.crazyMagic);
  const countCards = roomStore.crazyMagic.length;

  const controls = useHeartBeatAnimation(countCards);

  const onClick = useCallback(() => {
    if (!topCard) {
      return;
    }
    if (modalsStore.modals.length) {
      previewStore.show(<CardsModal
        cards={[topCard]}
        title="Карта магазина"
      />);
      return;
    }
    const onBuyClick = () => {
      modalsStore.close();
      ws.sendMessage({ event: EEventTypes.buyCrazyMagicCard });
    };
    modalsStore.show(<BuyCardModal
      card={topCard}
      onClick={onBuyClick}
    />);
  }, [topCard, modalsStore, previewStore]);

  return (
    <motion.div animate={controls}>
      <Card
        count={countCards}
        disabled={!isActive || (roomStore.activePlayer.totalPower || 0) < (topCard?.totalCost || 999)}
        onClick={onClick}
        title="Шальная магия"
        type={ECardTypes.crazyMagic}
      />
    </motion.div>
  );
});
