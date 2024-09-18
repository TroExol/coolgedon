import type { FC } from 'react';

import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { AnimatePresence, motion } from 'framer-motion';

import { store } from 'Store';
import { CardsModal } from 'Component/Modal/components/CardsModal';
import { Card } from 'Component/Card';

interface TProps {
    nickname: string;
}

export const Familiar: FC<TProps> = observer(({
  nickname,
}) => {
  const {
    modalsStore,
    roomStore,
    previewStore,
  } = store;

  const { familiarToBuy } = roomStore.getPlayer(nickname);
  const isMe = roomStore.isMe(nickname);

  const onClick = useCallback(() => {
    if (!familiarToBuy) {
      return;
    }
    previewStore.show(<CardsModal
      cards={[familiarToBuy]}
      title={isMe
        ? 'Твой фамильяр'
        : `Фамильяр игрока ${nickname}`}
    />);
  }, [familiarToBuy, isMe, modalsStore, nickname, previewStore]);

  return (
    <AnimatePresence mode="popLayout">
      {familiarToBuy && (
      <motion.div
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.4, opacity: 0 }}
        initial={false}
      >
        <Card
          mini
          number={familiarToBuy.number}
          onClick={onClick}
          title="Фамильяр"
          type={familiarToBuy.type}
        />
      </motion.div>
      )}
    </AnimatePresence>
  );
});
