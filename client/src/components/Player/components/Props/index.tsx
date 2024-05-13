import type { FC } from 'react';

import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'framer-motion';
import { ws } from 'Service/ws';
import { EEventTypes, type TProp } from '@coolgedon/shared';

import { store } from 'Store';
import { useHeartBeatAnimation } from 'Hook/useHeartBeatAnimation';
import { Prop } from 'Component/Prop';
import { PropsModal } from 'Component/Modal/components/PropsModal';
import { PlayPropsModal } from 'Component/Modal/components/PlayPropsModal';
import { PlayPropModal } from 'Component/Modal/components/PlayPropModal';

interface TProps {
    nickname: string;
}

export const Props: FC<TProps> = observer(({
  nickname,
}) => {
  const {
    modalsStore,
    roomStore,
    previewStore,
  } = store;
  const { props } = roomStore.getPlayer(nickname);
  const isMe = roomStore.isMe(nickname);
  const isActive = roomStore.isActive(nickname);
  const controls = useHeartBeatAnimation(props.length);

  const onClick = useCallback(() => {
    if (modalsStore.modals.length) {
      previewStore.show(
        <PropsModal
          props={props}
          title={isMe
            ? 'Твои свойства'
            : `Свойства игрока ${nickname}`}
        />,
      );
      return;
    }
    const onPlayClick = (prop: TProp) => {
      modalsStore.close();
      const onConfirmPlay = () => {
        ws.sendMessage({ event: EEventTypes.playProp, data: { prop } });
        modalsStore.close();
      };

      modalsStore.show(<PlayPropModal
        onConfirm={onConfirmPlay}
        prop={prop}
      />);
    };

    const content = isActive && isMe
      ? (
        <PlayPropsModal
          onClick={onPlayClick}
          props={props}
          title="Твои свойства"
        />
      )
      : (
        <PropsModal
          props={props}
          title={isMe
            ? 'Твои свойства'
            : `Свойства игрока ${nickname}`}
        />
      );
    modalsStore.show(content);
  }, [isActive, isMe, modalsStore, nickname, previewStore, props]);

  return (
    <motion.div animate={controls}>
      <Prop
        count={props.length}
        onClick={onClick}
      />
    </motion.div>
  );
});
