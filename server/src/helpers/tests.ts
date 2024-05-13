// noinspection UnnecessaryLocalVariableJS

import type { WebSocketServer } from 'ws';

import type { PartialBy } from 'Type/helpers';

import { Skull } from 'Entity/skull';
import { Room } from 'Entity/room';
import { Prop } from 'Entity/prop';
import { Player } from 'Entity/player';
import { Log } from 'Entity/log';
import { Card } from 'Entity/card';

import spyOn = jest.spyOn;
import fn = jest.fn;

export const makeId = () => {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  while (result.length < 10) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
};

export const createMockRoom = (name: string, adminNickname: string): Room => {
  const room = new Room({} as WebSocketServer, name, adminNickname);
  spyOn(room, 'wsSendMessage').mockImplementation(jest.fn);
  spyOn(room, 'wsSendMessageAsync').mockImplementation(async () => {});
  return room;
};

export const createMockPlayer = (params: PartialBy<ConstructorParameters<typeof Player>[0], 'prop' | 'familiarToBuy' | 'room'>): Player => {
  const room = params.room || createMockRoom('1', 'activePlayer');
  const propIndex = room.props.findIndex(({ id }) => id === 2);
  const player = new Player({
    ...params,
    room,
    prop: params.prop || room.props.splice(propIndex, 1)[0],
    familiarToBuy: params.familiarToBuy || room.familiars.splice(-1)[0],
  });
  return player;
};

export const createMockCard = (room: Room | undefined, params: Omit<ConstructorParameters<typeof Card>[0], 'id' | 'room'>): Card => {
  const mockRoom = createMockRoom('1', 'activePlayer');
  const card = new Card({ ...params, room: room || mockRoom, id: makeId() });
  return card;
};

export const createMockProp = (params: PartialBy<ConstructorParameters<typeof Prop>[0], 'room'>): Prop => {
  const room = params.room || createMockRoom('1', 'activePlayer');
  const prop = new Prop({ ...params, room });
  return prop;
};

export const createMockSkull = (params: PartialBy<ConstructorParameters<typeof Skull>[0], 'room'>): Skull => {
  const room = params.room || createMockRoom('1', 'activePlayer');
  const skull = new Skull({ ...params, room });
  return skull;
};

export const createMockLog = (params: ConstructorParameters<typeof Log>[0]): Log => {
  const log = new Log(params);
  return log;
};

export const addPlayerToRoom = (room: Room, player: Player) => {
  room.players[player.nickname] = player;
};

export const consoleErrorMockSpy = () => spyOn(console, 'error').mockImplementation(fn);

export const giveCardToPlayer = (card: Card, player: Player) => {
  card.ownerNickname = player.nickname;
  player.hand.push(card);
};

export const giveSkullToPlayer = (skull: Skull, player: Player) => {
  skull.ownerNickname = player.nickname;
  player.skulls.push(skull);
};
