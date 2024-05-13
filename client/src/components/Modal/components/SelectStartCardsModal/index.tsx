import type { FC } from 'react';

import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ws } from 'Service/ws';
import { EEventTypes, type TCard, type TProp } from '@coolgedon/shared';

import stylesModal from 'Component/Modal/Modal.module.css';
import { Button } from 'Component/Button';

import styles from './SelectStartCardsModal.module.css';
import { SelectPropsModal } from '../SelectPropsModal';
import { SelectCardsModal } from '../SelectCardsModal';

interface TProps {
  familiars: TCard[];
  props: TProp[];
  roomName: string;
  onConfirm: ({ prop, familiar }: {prop: TProp, familiar: TCard}) => void;
}

export const SelectStartCardsModal: FC<TProps> = observer(({
  familiars,
  props,
  roomName,
  onConfirm,
}) => {
  const [selectedFamiliar, setSelectedFamiliar] = useState<TCard>();
  const [selectedProp, setSelectedProp] = useState<TProp>();

  useEffect(() => {
    const onCloseWindow = () => {
      ws.sendMessage({
        event: EEventTypes.cancelSelectStartCards,
        data: {
          familiars,
          props,
        },
        roomName,
      });
    };
    window.addEventListener('beforeunload', onCloseWindow);
    const interval = setInterval(
      () => ws.sendMessage({ event: EEventTypes.ping }),
      10000,
    );

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', onCloseWindow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
