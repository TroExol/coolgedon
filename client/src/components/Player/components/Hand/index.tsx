import type { FC } from 'react';

import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'framer-motion';
import { ECardTypes } from '@coolgedon/shared';

import { store } from 'Store';
import { useHeartBeatAnimation } from 'Hook/useHeartBeatAnimation';
import { getLastElement } from 'Helpers';
import { CardsModal } from 'Component/Modal/components/CardsModal';
import { Card } from 'Component/Card';

interface TProps {
    nickname: string;
}

export const Hand: FC<TProps> = observer(({
  nickname,
}) => {
  const { roomStore, previewStore } = store;

  const { hand, countHand } = roomStore.getPlayer(nickname);
  const isMe = roomStore.isMe(nickname);
  const isActive = roomStore.isActive(nickname);
  const controls = useHeartBeatAnimation(hand?.length);

  const onClick = useCallback(() => {
    if (!hand) {
      return;
    }
    const componentToShow = (
      <CardsModal
        cards={hand}
        title={isMe
          ? 'Твоя рука'
          : `Рука игрока ${nickname}`}
      />
    );
    previewStore.show(componentToShow);
  }, [hand, isMe, nickname, previewStore]);

  return (
    <motion.div animate={controls}>
      <Card
        count={countHand}
        mini
        number={hand && getLastElement(hand)?.number}
        onClick={hand?.length && (isMe || isActive) ? onClick : undefined}
        title="Рука"
        type={hand?.length ? getLastElement(hand)?.type : ECardTypes.back}
      />
    </motion.div>
  );
});
