import type { TCard } from '@coolgedon/shared';

import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

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
      <Button
        className={styles.button}
        onClick={onClickHandler}
      >
        Разыграть
      </Button>
    </div>
  );
});
