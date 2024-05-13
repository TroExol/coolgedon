import type { FC } from 'react';

import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { AnimatePresence, motion } from 'framer-motion';

import { store } from 'Store';
import { useHeartBeatAnimation } from 'Hook/useHeartBeatAnimation';
import { getLastElement } from 'Helpers';
import { CardsModal } from 'Component/Modal/components/CardsModal';
import { Card } from 'Component/Card';

export const RemovedCards: FC = observer(() => {
  const { roomStore, previewStore } = store;

  const removed = roomStore.removed.cards;
  const controls = useHeartBeatAnimation(removed.length);

  const onClick = useCallback(() => {
    const componentToShow = (
      <CardsModal
        cards={removed}
        title="Уничтоженные карты"
      />
    );
    previewStore.show(componentToShow);
  }, [previewStore, removed]);

  return (
    <AnimatePresence>
      {removed.length
        ? (
          <motion.div animate={controls}>
            <Card
              count={removed.length}
              mini
              number={getLastElement(removed)?.number}
              onClick={removed.length ? onClick : undefined}
              title="Уничтоженные карты"
              type={getLastElement(removed)?.type}
            />
          </motion.div>
        )
        : null}
    </AnimatePresence>
  );
});
