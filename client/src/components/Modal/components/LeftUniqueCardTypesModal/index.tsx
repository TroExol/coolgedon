import type { FC } from 'react';
import type { ECardTypes, TCard } from '@coolgedon/shared';

import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { theSameTypeCards } from 'Helpers';
import stylesModal from 'Component/Modal/Modal.module.css';
import { Button } from 'Component/Button';

import styles from './LeftUniqueCardTypesModal.module.css';
import { SelectCardsModal } from '../SelectCardsModal';

export type TLeftUniqueCardTypesProps = {
  cards: TCard[];
  onConfirm: (data: { selectedCards: TCard[] }) => void;
}

export const LeftUniqueCardTypesModal: FC<TLeftUniqueCardTypesProps> = observer(({
  cards,
  onConfirm,
}) => {
  const [selectedCards, setSelectedCards] = useState<TCard[]>([]);
  const cardTypes = useMemo(() => cards.reduce<ECardTypes[]>((types, card) => {
    if (!types.includes(card.type)) {
      types.push(card.type);
    }
    return types;
  }, []), [cards]);
  const hasNotClearedTypes = cardTypes.length !== selectedCards.length;

  const onCardClick = (card: TCard) => {
    const selectedCardsWithoutClickedType = selectedCards.filter(c => !theSameTypeCards(card, c.type));
    setSelectedCards([...selectedCardsWithoutClickedType, card]);
  };

  return (
    <div className={styles.container}>
      <h3 className={stylesModal.title}>
        Оставь по 1 карте каждого типа, остальные уничтожь
      </h3>
      <SelectCardsModal
        cards={cards}
        onClick={onCardClick}
        selectedCards={selectedCards}
      />
      <Button
        className={styles.button}
        disabled={hasNotClearedTypes}
        onClick={() => onConfirm({ selectedCards })}
      >
        Уничтожить остальные
      </Button>
    </div>
  );
});
