import { EEventTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Prop } from 'Entity/prop';
import type { Card } from 'Entity/card';

import {
  getCardInFromClient,
  getCardsExceptCards,
  getPropInFromClient,
  getPropsExceptProps,
  shuffleArray,
} from 'Helpers';
import { Player } from 'Entity/player';

interface TJoinPlayerParams {
  room: Room;
  nickname: string;
}

const selectPropAndFamiliar = async (familiars: Card[], props: Prop[], room: Room, nickname: string) => {
  try {
    const res = await room.emitWithAck(nickname, EEventTypes.showModalSelectStartCards, {
      canClose: false,
      canCollapse: false,
      familiars: familiars.map(card => card.format()),
      props: props.map(prop => prop.format()),
    });

    const selectedProp = getPropInFromClient(res.prop, props);
    const selectedFamiliar = getCardInFromClient(res.familiar, familiars);

    if (!selectedProp || !selectedFamiliar) {
      return;
    }

    selectedProp.ownerNickname = nickname;
    selectedFamiliar.ownerNickname = nickname;

    return {
      prop: selectedProp,
      familiar: selectedFamiliar,
    };
  } catch (error) {
    console.error('Ошибка выбора карты и фамильяра', error);
  }
};

export const joinPlayer = async ({
  room, nickname,
}: TJoinPlayerParams) => {
  const player = room.getPlayer(nickname);

  if (!player) {
    room.familiars = shuffleArray(room.familiars);
    room.props = shuffleArray(room.props);
    const familiars = room.familiars.splice(-2);
    const props = room.props.splice(-2);

    const selected = await selectPropAndFamiliar(familiars, props, room, nickname);

    if (!selected) {
      room.familiars.push(...familiars);
      room.props.push(...props);
      room.getSocketClient(nickname)?.disconnect();
      return;
    }

    room.players[nickname] = new Player({
      nickname,
      familiarToBuy: selected.familiar,
      prop: selected.prop,
      room,
    });

    const leftFamiliar = getCardsExceptCards(familiars, [selected.familiar]);
    const leftProps = getPropsExceptProps(props, [selected.prop]);
    room.props.push(...leftProps);
    room.familiars.push(...leftFamiliar);

    if (room.playersArray.length === 1) {
      room.adminNickname = nickname;
      room.activePlayerNickname = nickname;
    }

    room.sendInfo();
  }

  room.logEvent(`Игрок ${nickname} подключился`);
};
