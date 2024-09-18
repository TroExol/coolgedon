import type {
  EEventTypes,
  EModalTypes,
  TModalParams,
  TServerToClientWithAckEvents,
} from '@coolgedon/shared';

import React from 'react';

import type { ComponentProp } from 'Type/helperTypes';

import { store } from 'Store';
import { SkullsModal } from 'Component/Modal/components/SkullsModal';
import { SelectVariantModal } from 'Component/Modal/components/SelectVariantModal';
import { SelectStartCardsModal } from 'Component/Modal/components/SelectStartCardsModal';
import { SelectSkullsAndVariantsModal } from 'Component/Modal/components/SelectSkullsAndVariantsModal';
import { SelectGuardCardModal } from 'Component/Modal/components/SelectGuardCardModal';
import { SelectCardsAndVariantsModal } from 'Component/Modal/components/SelectCardsAndVariantsModal';
import { PlayCardModal } from 'Component/Modal/components/PlayCardModal';
import { LeftUniqueCardTypesModal } from 'Component/Modal/components/LeftUniqueCardTypesModal';
import { EndGameModal } from 'Component/Modal/components/EndGameModal';
import { CardsModal } from 'Component/Modal/components/CardsModal';

type TGetSelectStartCardsComponentParams = {
  callback: Parameters<TServerToClientWithAckEvents[EEventTypes.showModalSelectStartCards]>[1];
} & TModalParams<EModalTypes.selectStartCards>;

export function getSelectStartCardsComponent({
  callback,
  familiars,
  props,
}: TGetSelectStartCardsComponentParams) {
  const onConfirm: ComponentProp<typeof SelectStartCardsModal, 'onConfirm'> = selectedData => {
    store.modalsStore.close(false);
    callback(selectedData);
  };

  return (
    <SelectStartCardsModal
      familiars={familiars}
      onConfirm={onConfirm}
      props={props}
    />
  );
}

export function getCardsComponent({
  cards,
  title,
}: TModalParams<EModalTypes.cards>) {
  return (
    <CardsModal
      cards={cards}
      title={title}
    />
  );
}

type TGetSelectCardsComponentParams = {
  callback: Parameters<TServerToClientWithAckEvents[EEventTypes.showModalSelectCards]>[1];
} & TModalParams<EModalTypes.selectCards>;

export function getSelectCardsComponent({
  callback,
  cards,
  count,
  variants,
  title,
}: TGetSelectCardsComponentParams) {
  const onConfirm: ComponentProp<typeof SelectCardsAndVariantsModal, 'onConfirm'> = ({ id, selectedCards }) => {
    store.modalsStore.close(false);
    callback({ selectedCards, variant: id });
  };

  return (
    <SelectCardsAndVariantsModal
      cards={cards}
      countCards={count}
      list={variants}
      onConfirm={onConfirm}
      title={title}
    />
  );
}

type TGetSelectGuardCardComponentParams = {
  callback: Parameters<TServerToClientWithAckEvents[EEventTypes.showModalSuggestGuard]>[1];
} & TModalParams<EModalTypes.suggestGuard>;

export function getSelectGuardCardComponent({
  callback,
  cardAttack,
  cardsToShow,
  cards,
  title,
}: TGetSelectGuardCardComponentParams) {
  const onConfirm: ComponentProp<typeof SelectGuardCardModal, 'onConfirm'> = selectedData => {
    store.modalsStore.close(false);
    callback(selectedData);
  };

  return (
    <SelectGuardCardModal
      cardAttack={cardAttack}
      cards={cards}
      cardsToShow={cardsToShow}
      onConfirm={onConfirm}
      title={title}
    />
  );
}

type TGetPlayCardComponentParams = {
  callback: Parameters<TServerToClientWithAckEvents[EEventTypes.showModalPlayCard]>[1];
} & TModalParams<EModalTypes.playCard>;

export function getPlayCardComponent({
  callback,
  card,
}: TGetPlayCardComponentParams) {
  const onConfirm = () => {
    store.modalsStore.close(false);
    callback();
  };

  return (
    <PlayCardModal
      card={card}
      onConfirm={onConfirm}
    />
  );
}

type TGetLeftUniqueCardTypesComponentParams = {
  callback: Parameters<TServerToClientWithAckEvents[EEventTypes.showModalLeftUniqueCardTypes]>[1];
} & TModalParams<EModalTypes.leftUniqueCardTypes>;

export function getLeftUniqueCardTypesComponent({
  callback,
  cards,
}: TGetLeftUniqueCardTypesComponentParams) {
  const onConfirm: ComponentProp<typeof LeftUniqueCardTypesModal, 'onConfirm'> = selectedData => {
    store.modalsStore.close(false);
    callback(selectedData);
  };

  return (
    <LeftUniqueCardTypesModal
      cards={cards}
      onConfirm={onConfirm}
    />
  );
}

type TGetSelectFromListComponentParams = {
  callback: Parameters<TServerToClientWithAckEvents[EEventTypes.showModalSelectVariant]>[1];
} & TModalParams<EModalTypes.selectVariant>;

export function getSelectVariantComponent({
  callback,
  variants,
  title,
}: TGetSelectFromListComponentParams) {
  const onConfirm: ComponentProp<typeof SelectVariantModal, 'onConfirm'> = ({ id }) => {
    store.modalsStore.close(false);
    callback({ variant: id });
  };

  return (
    <SelectVariantModal
      list={variants}
      onConfirm={onConfirm}
      title={title}
    />
  );
}

export function getSkullsComponent({
  skulls,
  title,
}: TModalParams<EModalTypes.skulls>) {
  return (
    <SkullsModal
      skulls={skulls}
      title={title}
    />
  );
}

type TGetSelectSkullsComponentParams = {
  callback: Parameters<TServerToClientWithAckEvents[EEventTypes.showModalSelectSkulls]>[1];
} & TModalParams<EModalTypes.selectSkulls>;

export function getSelectSkullsComponent({
  callback,
  count,
  variants,
  skulls,
  title,
}: TGetSelectSkullsComponentParams) {
  const onSelect: ComponentProp<typeof SelectSkullsAndVariantsModal, 'onConfirm'> = ({ selectedSkulls, id }) => {
    store.modalsStore.close(false);
    callback({
      selectedSkulls,
      variant: id,
    });
  };

  return (
    <SelectSkullsAndVariantsModal
      countSkull={count}
      list={variants}
      onConfirm={onSelect}
      skulls={skulls}
      title={title}
    />
  );
}

export function getEndGameComponent({
  players,
}: TModalParams<EModalTypes.endGame>) {
  store.modalsStore.closeAll();
  return (
    <EndGameModal players={players} />
  );
}
