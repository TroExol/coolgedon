import type { FC } from 'react';

import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'framer-motion';
import { ECardTypes } from '@coolgedon/shared';

import { store } from 'Store';
import { useHeartBeatAnimation } from 'Hook/useHeartBeatAnimation';
import { CardsModal } from 'Component/Modal/components/CardsModal';
import { Card } from 'Component/Card';

export const SluggishSticks: FC = observer(() => {
  const { roomStore, previewStore } = store;

  const controls = useHeartBeatAnimation(roomStore.sluggishStick.length);
  const onClick = useCallback(() => {
    const componentToShow = (
      <CardsModal
        cards={roomStore.sluggishStick.slice(-1)}
        title="Вялая пялочка"
      />
    );
    previewStore.show(componentToShow);
  }, [roomStore.sluggishStick, previewStore]);

  return (
    <motion.div animate={controls}>
      <Card
        count={roomStore.sluggishStick.length}
        mini
        onClick={onClick}
        title="Вялая палочка"
        type={ECardTypes.sluggishStick}
      />
    </motion.div>
  );
});
