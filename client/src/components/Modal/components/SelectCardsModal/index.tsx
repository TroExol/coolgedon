import type { FC } from 'react';
import type { TCard } from '@coolgedon/shared';

import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';

import { theSameCards } from 'Helpers';
import stylesModal from 'Component/Modal/Modal.module.css';
import { Card } from 'Component/Card';

import styles from './SelectCardsModal.module.css';

interface TProps {
  cards: TCard[];
  title?: string;
  selectedCards: TCard[];
  count?: number;
  onClick?: (card: TCard) => void;
}

export const SelectCardsModal: FC<TProps> = observer(({
  cards,
  selectedCards,
  title,
  count,
  onClick,
}) => {
  const reversedCards = useMemo(() => [...cards].reverse(), [cards]);
  const bordered = (card: TCard) => selectedCards.some(c => theSameCards(c, card));

  return (
    <div>
      {title && (<h3 className={stylesModal.title}>{title}</h3>)}
      <div className={styles.container}>
        {reversedCards.map(card => (
          <Card
            big
            bordered={bordered(card)}
            description={(card.data as { description?: string; })?.description}
            key={card.id}
            number={card.number}
            onClick={onClick && count !== 0 ? () => onClick(card) : undefined}
            type={card.type}
          />
        ))}
      </div>
    </div>
  );
});
