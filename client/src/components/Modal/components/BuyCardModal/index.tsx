import type { FC, MouseEventHandler } from 'react';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { ECardTypes, type TCard } from '@coolgedon/shared';

import { store } from 'Store';
import { theSameTypeCards } from 'Helpers';
import { Card } from 'Component/Card';
import { Button } from 'Component/Button';

import styles from './BuyCardModal.module.css';

interface TProps {
  card: TCard;
  onClick: MouseEventHandler;
}

export const BuyCardModal: FC<TProps> = observer(({
  card,
  onClick,
}) => {
  const { roomStore } = store;

  return (
    <div className={styles.container}>
      <Card
        big
        number={card.number}
        type={card.type}
      />
      {roomStore.isActive(roomStore.me)
        && (roomStore.me.totalPower || 0) >= (card.totalCost || 999)
        && !roomStore.gameEnded
        && !theSameTypeCards(card, ECardTypes.lawlessnesses) && (
        <Button
          className={styles.button}
          onClick={onClick}
        >
          Покупаю!
        </Button>
      )}
    </div>
  );
});
