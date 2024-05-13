import type { FC } from 'react';
import type { TCard, TVariant } from '@coolgedon/shared';

import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { theSameCards } from 'Helpers';
import stylesModal from 'Component/Modal/Modal.module.css';
import { Button } from 'Component/Button';

import styles from './SelectCardsAndVariantsModal.module.css';
import { SelectCardsModal } from '../SelectCardsModal';

export type TSelectCardsProps = {
  cards: TCard[];
  countCards: number;
  list: { id: number | string, value: string }[];
  onConfirm: (data: TVariant & { selectedCards: TCard[] }) => void;
  title?: string;
}

export const SelectCardsAndVariantsModal: FC<TSelectCardsProps> = observer(({
  cards,
  countCards,
  list,
  onConfirm,
  title,
}) => {
  const [selectedCards, setSelectedCards] = useState<TCard[]>([]);

  const onCardClick = useCallback((card: TCard) => {
    if (countCards <= 0) {
      return;
    }
    const selectedCardIndex = selectedCards.findIndex(c => theSameCards(card, c));

    if (selectedCardIndex !== -1) {
      const newSelectedCards = selectedCards.filter((_, index) => index !== selectedCardIndex);
      setSelectedCards(newSelectedCards);
      return;
    }

    if (selectedCards.length >= countCards) {
      setSelectedCards([...selectedCards.slice(1), card]);
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  }, [countCards, selectedCards]);

  return (
    <div>
      {title && (<h3 className={stylesModal.title}>{title}</h3>)}
      <div className={styles.container}>
        <SelectCardsModal
          cards={cards}
          count={countCards}
          onClick={onCardClick}
          selectedCards={selectedCards}
        />
        <div className={styles.buttons}>
          {list.map(({ id, value }) => (
            <Button
              disabled={selectedCards.length !== cards.length
                  && selectedCards.length !== countCards
                  && countCards !== undefined}
              key={id}
              onClick={() => onConfirm({ id, value, selectedCards })}
            >
              {value}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
});
