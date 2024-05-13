import type { FC } from 'react';

import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'framer-motion';

import { store } from 'Store';
import { useHeartBeatAnimation } from 'Hook/useHeartBeatAnimation';
import { getLastElement } from 'Helpers';
import { CardsModal } from 'Component/Modal/components/CardsModal';
import { Card } from 'Component/Card';

interface TProps {
    nickname: string;
}

export const Discard: FC<TProps> = observer(({
  nickname,
}) => {
  const { roomStore, previewStore } = store;

  const { discard } = roomStore.getPlayer(nickname);
  const isMe = roomStore.isMe(nickname);
  const controls = useHeartBeatAnimation(discard.length);

  const onClick = useCallback(() => {
    const componentToShow = (
      <CardsModal
        cards={discard}
        title={isMe
          ? 'Твой сброс'
          : `Сброс игрока ${nickname}`}
      />
    );
    previewStore.show(componentToShow);
  }, [discard, isMe, nickname, previewStore]);

  return (
    <motion.div animate={controls}>
      <Card
        count={discard.length}
        mini
        number={getLastElement(discard)?.number}
        onClick={discard.length
          ? onClick
          : undefined}
        title="Сброс"
        type={getLastElement(discard)?.type}
      />
    </motion.div>
  );
});
