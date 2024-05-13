import type { FC } from 'react';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'framer-motion';
import { ECardTypes } from '@coolgedon/shared';

import { store } from 'Store';
import { useHeartBeatAnimation } from 'Hook/useHeartBeatAnimation';
import { Card } from 'Component/Card';

export const Deck: FC = observer(() => {
  const { roomStore } = store;

  const controls = useHeartBeatAnimation(roomStore.deck.length);

  return (
    <motion.div animate={controls}>
      <Card
        count={roomStore.deck.length}
        mini
        title="Основная колода"
        type={ECardTypes.back}
      />
    </motion.div>
  );
});
