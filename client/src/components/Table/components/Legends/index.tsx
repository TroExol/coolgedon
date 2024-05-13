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

export const Legends: FC = observer(() => {
  const {
    roomStore,
    modalsStore,
    previewStore,
  } = store;

  const topLegend = getLastElement(roomStore.legends);
  const isActiveMe = roomStore.isActive(roomStore.me);

  const controls = useHeartBeatAnimation(roomStore.legends.length);
  const onClick = useCallback(() => {
    if (!topLegend) {
      return;
    }
    if (modalsStore.modals.length) {
      previewStore.show(<CardsModal
        cards={[topLegend]}
        title="Карта магазина"
      />);
      return;
    }
    const onBuyClick = () => {
      modalsStore.close();
      ws.sendMessage({ event: EEventTypes.buyLegendCard });
    };
    modalsStore.show(<BuyCardModal
      card={topLegend}
      onClick={onBuyClick}
    />);
  }, [topLegend, modalsStore, previewStore]);

  return (
    <motion.div animate={controls}>
      <Card
        count={roomStore.legends.length}
        disabled={!isActiveMe || (roomStore.activePlayer.totalPower || 0) < (topLegend?.totalCost || 999)}
        number={topLegend?.number}
        onClick={onClick}
        title="Легенды"
        type={ECardTypes.legends}
      />
    </motion.div>
  );
});
