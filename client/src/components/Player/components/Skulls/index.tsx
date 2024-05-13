import type { FC } from 'react';

import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { AnimatePresence, motion } from 'framer-motion';

import { store } from 'Store';
import { useHeartBeatAnimation } from 'Hook/useHeartBeatAnimation';
import { Skull } from 'Component/Skull';
import { SkullsModal } from 'Component/Modal/components/SkullsModal';

interface TProps {
    nickname: string;
}

export const Skulls: FC<TProps> = observer(({
  nickname,
}) => {
  const { roomStore, previewStore } = store;
  const { skulls } = roomStore.getPlayer(nickname);
  const isMe = roomStore.isMe(nickname);
  const controls = useHeartBeatAnimation(skulls.length);

  const onClick = useCallback(() => {
    const componentToShow = (
      <SkullsModal
        skulls={skulls}
        title={isMe
          ? 'Твои дохлые колдуны'
          : `Дохлые колдуны игрока ${nickname}`}
      />
    );
    previewStore.show(componentToShow);
  }, [isMe, nickname, previewStore, skulls]);

  return (
    <AnimatePresence mode="popLayout">
      {skulls.length && (
        <motion.div animate={controls}>
          <Skull
            count={skulls.length}
            onClick={onClick}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
});
