import type { WebSocketServer } from 'ws';
import type WebSocket from 'ws';

import {
  EEventTypes, EModalTypes, type TCard, type TProp,
} from '@coolgedon/shared';

import type { Prop } from 'Entity/prop';
import type { Card } from 'Entity/card';

import {
  getCardInFromClient,
  getCardsExceptCards,
  getPropInFromClient,
  getPropsExceptProps,
  shuffleArray,
} from 'Helpers';
import { Room, rooms, wsClients } from 'Entity/room';
import { Player } from 'Entity/player';

interface TSelectStartCardsParams {
  room?: Room;
  roomName: string
  wss: WebSocketServer;
  ws: WebSocket;
  nickname: string;
}

const selectPropAndFamiliar = async (familiars: Card[], props: Prop[], room: Room, nickname: string) => {
  const res = await room.wsSendMessageAsync<{ familiar: TCard, prop: TProp }>(nickname, {
    event: EEventTypes.showModal,
    data: {
      modalType: EModalTypes.selectStartCards,
      canClose: false,
      canCollapse: false,
      familiars: familiars.map(card => card.format()),
      props: props.map(prop => prop.format()),
      roomName: room.name,
    },
  });

  const selectedProp = getPropInFromClient(res.prop, props);
  const selectedFamiliar = getCardInFromClient(res.familiar, familiars);

  if (!selectedProp || !selectedFamiliar) {
    return;
  }

  selectedProp.ownerNickname = nickname;
  selectedFamiliar.ownerNickname = nickname;

  return { prop: selectedProp, familiar: selectedFamiliar };
};

export const joinPlayer = async ({
  room, wss, ws, roomName, nickname,
}: TSelectStartCardsParams) => {
  try {
    if (!room) {
      rooms[roomName] = new Room(wss, roomName, nickname);
      wsClients[roomName] = {};
    }

    const newRoom = rooms[roomName];

    if (newRoom.gameEnded) {
      ws.close(1000, 'Игра окончена');
      throw new Error('Игра окончена');
    }

    if (newRoom.getWsClient(nickname)) {
      ws.close(1000, 'Пользователь с таким ником уже в игре');
      throw new Error('Пользователь с таким ником уже в игре');
    }

    if (Object.values(wsClients[roomName]).length >= 5) {
      ws.close(1000, 'Игроков уже 5');
      throw new Error('Игроков уже 5');
    }

    wsClients[roomName][nickname] = ws;

    const player = newRoom.getPlayer(nickname);

    if (!player) {
      newRoom.familiars = shuffleArray(newRoom.familiars);
      newRoom.props = shuffleArray(newRoom.props);
      const familiars = newRoom.familiars.splice(-2);
      const props = newRoom.props.splice(-2);

      const selected = await selectPropAndFamiliar(familiars, props, newRoom, nickname);

      if (!selected) {
        return;
      }

      newRoom.players[nickname] = new Player({
        nickname,
        familiarToBuy: selected.familiar,
        prop: selected.prop,
        room: newRoom,
      });

      const leftFamiliar = getCardsExceptCards(familiars, [selected.familiar]);
      const leftProps = getPropsExceptProps(props, [selected.prop]);
      newRoom.props.push(...leftProps);
      newRoom.familiars.push(...leftFamiliar);
    }
    newRoom.logEvent(`Игрок ${nickname} подключился`);
    newRoom.sendInfo();
  } catch (error) {
    console.error('Ошибка созданиия игрока', error);
  }
};
