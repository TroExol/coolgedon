/* eslint-disable no-use-before-define */
import type { Modal } from 'Store/modals';
import type { TModalData, TModalParams } from '@coolgedon/shared';

import React from 'react';
import { ws } from 'Service/ws';
import { EModalTypes } from '@coolgedon/shared';

import type { ComponentProp } from 'Type/helperTypes';

import { store } from 'Store';
import { SkullsModal } from 'Component/Modal/components/SkullsModal';
import { SelectStartCardsModal } from 'Component/Modal/components/SelectStartCardsModal';
import { SelectSkullsAndVariantsModal } from 'Component/Modal/components/SelectSkullsAndVariantsModal';
import { SelectGuardCardModal } from 'Component/Modal/components/SelectGuardCardModal';
import { SelectFromListModal } from 'Component/Modal/components/SelectFromListModal';
import { SelectCardsAndVariantsModal } from 'Component/Modal/components/SelectCardsAndVariantsModal';
import { PlayCardModal } from 'Component/Modal/components/PlayCardModal';
import { LeftUniqueCardTypesModal } from 'Component/Modal/components/LeftUniqueCardTypesModal';
import { EndGameModal } from 'Component/Modal/components/EndGameModal';
import { CardsModal } from 'Component/Modal/components/CardsModal';

interface TShowModalHandlerParams {
    requestId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: TModalParams;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function showModalHandler({ requestId, data }: TShowModalHandlerParams) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  let content: Modal['content'];

  if (data.modalType === EModalTypes.selectStartCards) {
    content = getSelectStartCardsComponent({ requestId, data });
  } else if (data.modalType === EModalTypes.cards) {
    content = getCardsComponent({ requestId, data });
  } else if (data.modalType === EModalTypes.playCard) {
    content = getPlayCardComponent({ requestId, data });
  } else if (data.modalType === EModalTypes.suggestGuard) {
    content = getSelectGuardCardComponent({ requestId, data });
  } else if (data.modalType === EModalTypes.leftUniqueCardTypes) {
    content = getLeftUniqueCardTypesComponent({ requestId, data });
  } else if (data.modalType === EModalTypes.endGame) {
    content = getEndGameComponent({ data });
  } else if (data.modalType === EModalTypes.skulls) {
    content = getSelectSkullsComponent({ requestId, data });
  } else if (data.modalType === EModalTypes.list) {
    content = getSelectFromListComponent({ requestId, data });
  }

  const onClose = () => {
    ws.sendMessage({
      requestId,
      data: {
        ...data,
        closed: true,
      },
    });
  };

  store.modalsStore.show(content, {
    canClose: data.canClose,
    canCollapse: data.canCollapse,
    onClose: requestId
      ? onClose
      : undefined,
  });
}

interface TGetSelectStartCardsComponentParams {
    requestId: string;
    data: TModalData<EModalTypes.selectStartCards>;
}

function getSelectStartCardsComponent({
  requestId,
  data: {
    familiars,
    props,
    roomName,
  },
}: TGetSelectStartCardsComponentParams) {
  const onConfirm: ComponentProp<typeof SelectStartCardsModal, 'onConfirm'> = selectedData => {
    store.modalsStore.close(false);
    ws.sendMessage({
      requestId,
      data: selectedData,
    });
  };

  return (
    <SelectStartCardsModal
      familiars={familiars}
      onConfirm={onConfirm}
      props={props}
      roomName={roomName}
    />
  );
}

interface TGetCardsComponentParams {
    requestId: string;
    data: TModalData<EModalTypes.cards>;
}

function getCardsComponent({
  requestId,
  data: {
    select,
    cards,
    count,
    variants,
    title,
  },
}: TGetCardsComponentParams) {
  const onConfirm: ComponentProp<typeof SelectCardsAndVariantsModal, 'onConfirm'> = ({ id, selectedCards }) => {
    store.modalsStore.close(false);
    ws.sendMessage({
      requestId,
      data: {
        selectedCards,
        variant: id,
      },
    });
  };

  return select
    ? (
      <SelectCardsAndVariantsModal
        cards={cards}
        countCards={count}
        list={variants}
        onConfirm={onConfirm}
        title={title}
      />
    )
    : (
      <CardsModal
        cards={cards}
        title={title}
      />
    );
}

interface TGetSelectGuardCardComponentParams {
    requestId: string;
    data: TModalData<EModalTypes.suggestGuard>;
}

function getSelectGuardCardComponent({
  requestId,
  data: {
    cardAttack,
    cardsToShow,
    cards,
    title,
  },
}: TGetSelectGuardCardComponentParams) {
  const onConfirm: ComponentProp<typeof SelectGuardCardModal, 'onConfirm'> = selectedData => {
    store.modalsStore.close(false);
    ws.sendMessage({
      requestId,
      data: selectedData,
    });
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

interface TGetPlayCardComponentParams {
    requestId: string;
    data: TModalData<EModalTypes.playCard>;
}

function getPlayCardComponent({
  requestId,
  data: { card },
}: TGetPlayCardComponentParams) {
  const onConfirm = () => {
    store.modalsStore.close(false);
    ws.sendMessage({ requestId, data: { card } });
  };

  return (
    <PlayCardModal
      card={card}
      onConfirm={onConfirm}
    />
  );
}

interface TGetLeftUniqueCardTypesComponentParams {
    requestId: string;
    data: TModalData<EModalTypes.leftUniqueCardTypes>;
}

function getLeftUniqueCardTypesComponent({
  requestId,
  data: { cards },
}: TGetLeftUniqueCardTypesComponentParams) {
  const onConfirm: ComponentProp<typeof LeftUniqueCardTypesModal, 'onConfirm'> = selectedData => {
    store.modalsStore.close(false);
    ws.sendMessage({
      requestId,
      data: selectedData,
    });
  };

  return (
    <LeftUniqueCardTypesModal
      cards={cards}
      onConfirm={onConfirm}
    />
  );
}

interface TGetSelectFromListComponentParams {
    requestId: string;
    data: TModalData<EModalTypes.list>;
}

function getSelectFromListComponent({
  requestId,
  data: {
    variants,
    title,
  },
}: TGetSelectFromListComponentParams) {
  const onConfirm: ComponentProp<typeof SelectFromListModal, 'onConfirm'> = ({ id }) => {
    store.modalsStore.close(false);
    ws.sendMessage({
      requestId,
      data: {
        variant: id,
      },
    });
  };

  return (
    <SelectFromListModal
      list={variants}
      onConfirm={onConfirm}
      title={title}
    />
  );
}

interface TGetSelectSkullsComponentParams {
    requestId: string;
    data: TModalData<EModalTypes.skulls>;
}

function getSelectSkullsComponent({
  requestId,
  data: {
    select,
    count,
    variants,
    skulls,
    title,
  },
}: TGetSelectSkullsComponentParams) {
  const onSelect: ComponentProp<typeof SelectSkullsAndVariantsModal, 'onConfirm'> = ({ selectedSkulls, id }) => {
    store.modalsStore.close(false);
    ws.sendMessage({
      requestId,
      data: {
        selectedSkulls,
        variant: id,
      },
    });
  };

  return select
    ? (
      <SelectSkullsAndVariantsModal
        countSkull={count}
        list={variants}
        onConfirm={onSelect}
        skulls={skulls}
        title={title}
      />
    )
    : (
      <SkullsModal
        skulls={skulls}
        title={title}
      />
    );
}

interface TGetEndGameComponentParams {
  data: TModalData<EModalTypes.endGame>;
}

function getEndGameComponent({
  data: {
    players,
  },
}: TGetEndGameComponentParams) {
  store.modalsStore.closeAll();
  return (
    <EndGameModal players={players} />
  );
}
