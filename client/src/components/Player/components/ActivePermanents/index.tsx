import type { FC } from 'react';

import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { AnimatePresence, motion } from 'framer-motion';

import { store } from 'Store';
import { useHeartBeatAnimation } from 'Hook/useHeartBeatAnimation';
import { getLastElement } from 'Helpers';
import { CardsModal } from 'Component/Modal/components/CardsModal';
import { Card } from 'Component/Card';

interface TProps {
    nickname: string;
}

export const ActivePermanents: FC<TProps> = observer(({
  nickname,
}) => {
  const { roomStore, previewStore } = store;

  const { activePermanent } = roomStore.getPlayer(nickname);
  const isMe = roomStore.isMe(nickname);
  const controls = useHeartBeatAnimation(activePermanent.length);

  const onClick = useCallback(() => {
    const componentToShow = (
      <CardsModal
        cards={activePermanent}
        title={isMe
          ? 'Твои постоянки'
          : `Постоянки игрока ${nickname}`}
      />
    );
    previewStore.show(componentToShow);
  }, [activePermanent, isMe, nickname, previewStore]);

  return (
    <AnimatePresence mode="popLayout">
      {activePermanent.length && (
        <motion.div animate={controls}>
          <Card
            count={activePermanent.length}
            mini
            number={getLastElement(activePermanent)?.number}
            onClick={onClick}
            title="Постоянка"
            type={getLastElement(activePermanent)?.type}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
});
