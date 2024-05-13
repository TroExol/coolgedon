import type { FC } from 'react';
import type { TCard } from '@coolgedon/shared';

import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';

import stylesModal from 'Component/Modal/Modal.module.css';
import { Card } from 'Component/Card';

import styles from './CardsModal.module.css';

interface TProps {
  cards: TCard[];
  title?: string;
}

export const CardsModal: FC<TProps> = observer(({
  cards,
  title,
}) => {
  const reversedCards = useMemo(() => [...cards].reverse(), [cards]);
  return (
    <div>
      {title && (<h3 className={stylesModal.title}>{title}</h3>)}
      <div className={styles.container}>
        {reversedCards.map(card => (
          <Card
            big
            key={card.id}
            number={card.number}
            type={card.type}
          />
        ))}
      </div>
    </div>
  );
});
