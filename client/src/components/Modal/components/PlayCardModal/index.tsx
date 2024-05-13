import type { TCard } from '@coolgedon/shared';

import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { store } from 'Store';
import { Card } from 'Component/Card';
import { Button } from 'Component/Button';

import styles from './PlayCardModal.module.css';

interface TProps {
  card: TCard;
  onConfirm: () => void;
}

export const PlayCardModal = observer(({
  card,
  onConfirm,
}: TProps) => {
  const { roomStore } = store;

  const onClickHandler = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  return (
    <div className={styles.container}>
      <Card
        big
        number={card.number}
        type={card.type}
      />
      {card.canPlay && roomStore.isActive(roomStore.me) && !roomStore.gameEnded && (
        <Button
          className={styles.button}
          onClick={onClickHandler}
        >
          Разыграть
        </Button>
      )}
    </div>
  );
});
