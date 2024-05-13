import type { FC } from 'react';

import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'framer-motion';

import { store } from 'Store';
import { useHeartBeatAnimation } from 'Hook/useHeartBeatAnimation';
import { Skull } from 'Component/Skull';
import { SkullsModal } from 'Component/Modal/components/SkullsModal';

export const Skulls: FC = observer(() => {
  const { roomStore, previewStore } = store;

  const controls = useHeartBeatAnimation(roomStore.skulls.length);

  const onSkullsClick = useCallback(() => {
    const componentToShow = (
      <SkullsModal
        skulls={roomStore.skulls}
        title="Оставшиеся дохлые колдуны"
      />
    );
    previewStore.show(componentToShow);
  }, [roomStore.skulls, previewStore]);

  return (
    <motion.div animate={controls}>
      <Skull
        count={roomStore.skulls.length}
        onClick={onSkullsClick}
      />
    </motion.div>
  );
});
