import type { FC } from 'react';

import React from 'react';
import { observer } from 'mobx-react-lite';

import { store } from 'Store';
import { Player } from 'Component/Player';

import styles from './Players.module.css';

export const Players: FC = observer(() => {
  const { roomStore } = store;
  return (
    <div className={styles.players}>
      {roomStore.playersArray.map(player => (
        <Player
          key={player.nickname}
          player={player}
        />
      ))}
    </div>
  );
});
