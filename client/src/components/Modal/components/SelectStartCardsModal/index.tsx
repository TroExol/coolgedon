import type { FC } from 'react';
import type { TCard, TProp } from '@coolgedon/shared';

import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';

import stylesModal from 'Component/Modal/Modal.module.css';
import { Button } from 'Component/Button';

import styles from './SelectStartCardsModal.module.css';
import { SelectPropsModal } from '../SelectPropsModal';
import { SelectCardsModal } from '../SelectCardsModal';

interface TProps {
  familiars: TCard[];
  props: TProp[];
  onConfirm: ({ prop, familiar }: {prop: TProp, familiar: TCard}) => void;
}

export const SelectStartCardsModal: FC<TProps> = observer(({
  familiars,
  props,
  onConfirm,
}) => {
  const [selectedFamiliar, setSelectedFamiliar] = useState<TCard>();
  const [selectedProp, setSelectedProp] = useState<TProp>();

  return (
    <div className={styles.container}>
      <h3 className={stylesModal.title}>Выберите фамильяра и свойство</h3>
      <SelectCardsModal
        cards={familiars}
        onClick={setSelectedFamiliar}
        selectedCards={selectedFamiliar ? [selectedFamiliar] : []}
      />
      <div className={styles.props}>
        <SelectPropsModal
          onClick={setSelectedProp}
          props={props}
          selectedProps={selectedProp ? [selectedProp] : []}
        />
      </div>
      <Button
        className={styles.button}
        disabled={!selectedProp || !selectedFamiliar}
        onClick={() => onConfirm({ prop: selectedProp as TProp, familiar: selectedFamiliar as TCard })}
      >
        В бой
      </Button>
    </div>
  );
});
