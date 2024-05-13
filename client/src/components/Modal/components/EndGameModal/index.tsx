import type { FC } from 'react';
import type { TPlayer } from '@coolgedon/shared';

import React from 'react';
import { observer } from 'mobx-react-lite';

import stylesModal from 'Component/Modal/Modal.module.css';

import styles from './EndGameModal.module.css';

interface TProps {
  players: TPlayer[];
}

export const EndGameModal: FC<TProps> = observer(({ players }) => (
  <div>
    <h3 className={stylesModal.title}>Игра окончена</h3>
    <div className={styles.container}>
      {players.map((player, index) => (
        <div className={styles.player}>
          Место
          {' '}
          {index + 1}
          {': '}
          {player.nickname}
          {' '}
          набрал
          {' '}
          {player.victoryPoints}
          {' '}
          победных очков
        </div>
      ))}
    </div>
  </div>
));
