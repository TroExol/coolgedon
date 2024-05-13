import type { FC } from 'react';
import type { TPlayer } from '@coolgedon/shared';

import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'framer-motion';
import classNames from 'classnames';

import { store } from 'Store';
import { useHeartBeatAnimation } from 'Hook/useHeartBeatAnimation';
import { onEnter } from 'Helpers';
import { TowerCthulhu } from 'Component/TowerCthulhu';
import { Tower } from 'Component/Tower';
import { RemovePlayerModal } from 'Component/Modal/components/RemovePlayerModal';

import { Skulls } from './components/Skulls';
import { Props } from './components/Props';
import { Hand } from './components/Hand';
import { Familiar } from './components/Familiar';
import { Discard } from './components/Discard';
import { Deck } from './components/Deck';
import { ActivePermanents } from './components/ActivePermanents';
import styles from './Player.module.css';

interface TProps {
  player: TPlayer;
  className?: string;
}

export const Player: FC<TProps> = observer(({
  player: {
    nickname,
    hp,
    victoryPoints,
    hasTower,
    hasTowerC,
  },
  className,
}) => {
  const { roomStore, modalsStore } = store;

  const isMe = roomStore.isMe(nickname);
  const hpControls = useHeartBeatAnimation(hp);
  const victoryPointsControls = useHeartBeatAnimation(victoryPoints);

  const onRemovePlayer = useCallback(() => {
    if (modalsStore.modals.length) {
      return;
    }
    const content = (<RemovePlayerModal nickname={nickname} />);
    modalsStore.show(content);
  }, [modalsStore, nickname]);

  return (
    <div
      className={classNames(
        styles.container,
        className,
        {
          [styles.active]: roomStore.isActive(nickname),
        },
      )}
    >
      {roomStore.isAdmin(roomStore.me) && !isMe && (
        <div
          className={styles.removeButton}
          onClick={onRemovePlayer}
          onKeyDown={onEnter(onRemovePlayer)}
          role="button"
          tabIndex={0}
        >
          &#x2717;
        </div>
      )}
      {nickname}
      <div className={styles.row}>
        <motion.span
          animate={hpControls}
          style={{ display: 'inline-block' }}
        >
          &#9829;&nbsp;
          {hp}
        </motion.span>
        {isMe && (
          <motion.span
            animate={victoryPointsControls}
            style={{ display: 'inline-block' }}
          >
            &#9733;&nbsp;
            {victoryPoints}
          </motion.span>
        )}
      </div>
      <div className={styles.row}>
        <ActivePermanents nickname={nickname} />
        <Familiar nickname={nickname} />
        <Props nickname={nickname} />
        <Skulls nickname={nickname} />
        {hasTower && (<Tower />)}
        {hasTowerC && (<TowerCthulhu />)}
      </div>
      <div className={styles.row}>
        <Discard nickname={nickname} />
        <Deck nickname={nickname} />
        <Hand nickname={nickname} />
      </div>
    </div>
  );
});
