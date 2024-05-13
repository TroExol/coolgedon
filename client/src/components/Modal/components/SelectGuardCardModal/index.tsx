import type { FC } from 'react';
import type { TCard } from '@coolgedon/shared';

import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { SelectCardsModal } from 'Component/Modal/components/SelectCardsModal';
import stylesModal from 'Component/Modal/Modal.module.css';
import { Card } from 'Component/Card';
import { Button } from 'Component/Button';

import styles from './SelectGuardCardModal.module.css';

export type TSelectCardsProps = {
  cards: TCard[];
  onConfirm: (data: { selectedCard?: TCard }) => void;
  title?: string;
  cardAttack: TCard;
  cardsToShow?: TCard[];
}

export const SelectGuardCardModal: FC<TSelectCardsProps> = observer(({
  cards,
  onConfirm,
  title,
  cardAttack,
  cardsToShow,
}) => {
  const [selectedCard, setSelectedCard] = useState<TCard>();

  return (
    <div>
      {title && (<h3 className={stylesModal.title}>{title}</h3>)}
      <div className={styles.container}>
        {!!cardsToShow?.length && (
          <SelectCardsModal
            cards={cardsToShow}
            count={0}
            selectedCards={[]}
          />
        )}
        <div className={styles.row}>
          <h3>Карта атаки</h3>
          <Card
            big
            number={cardAttack.number}
            type={cardAttack.type}
          />
        </div>
        <div className={styles.row}>
          <h3>Вы можете выбрать карту для защиты</h3>
          <SelectCardsModal
            cards={cards}
            count={1}
            onClick={setSelectedCard}
            selectedCards={selectedCard ? [selectedCard] : []}
          />
        </div>
        <Button
          className={styles.button}
          disabled={!selectedCard}
          onClick={() => onConfirm({ selectedCard })}
        >
          Защититься
        </Button>
      </div>
    </div>
  );
});
