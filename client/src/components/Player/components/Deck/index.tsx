import type { FC } from 'react';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'framer-motion';
import { ECardTypes } from '@coolgedon/shared';

import { store } from 'Store';
import { useHeartBeatAnimation } from 'Hook/useHeartBeatAnimation';
import { Card } from 'Component/Card';

interface TProps {
    nickname: string;
}

export const Deck: FC<TProps> = observer(({
  nickname,
}) => {
  const { roomStore } = store;

  const { countDeck } = roomStore.getPlayer(nickname);
  const controls = useHeartBeatAnimation(countDeck);

  return (
    <motion.div animate={controls}>
      <Card
        count={countDeck}
        mini
        title="Колода"
        type={ECardTypes.back}
      />
    </motion.div>
  );
});
