import type { WebSocket, WebSocketServer } from 'ws';

import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Player } from 'Entity/player';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';
import { joinPlayer } from 'Event/joinPlayer';
import { Room, rooms, wsClients } from 'Entity/room';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('joinPlayer', () => {
  let room: Room;
  let activePlayer: Player;
  let ws: WebSocket;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    wsClients[room.name] = {};
    rooms[room.name] = room;
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
    testHelper.addPlayerToRoom(room, activePlayer);
    consoleErrorSpy = testHelper.consoleErrorMockSpy();
    ws = {} as WebSocket;
    ws.close = fn();

    spyOn(room, 'logEvent');
    spyOn(room, 'sendInfo');
  });

  afterEach(() => {
    delete wsClients[room.name];
    delete rooms[room.name];
    consoleErrorSpy?.mockRestore();
  });

  test('Подключается игрок', async () => {
    room.familiars = room.familiars.slice(-2);
    room.props = room.props.slice(-2);
    const topFamiliar = getLastElement(room.familiars)!;
    const topProp = getLastElement(room.props)!;
    spyOn(room, 'wsSendMessageAsync').mockImplementation(async () => ({ prop: topProp.format(), familiar: topFamiliar.format() }));
    const countFamiliars = room.familiars.length;
    const countProps = room.props.length;

    await joinPlayer({
      room,
      roomName: room.name,
      nickname: 'otherPlayer',
      wss: {} as WebSocketServer,
      ws,
    });

    expect(wsClients[room.name].otherPlayer).toEqual(ws);
    expect(room.players.otherPlayer.nickname).toEqual('otherPlayer');
    expect(room.players.otherPlayer.familiarToBuy).toEqual(topFamiliar);
    expect(room.players.otherPlayer.props.indexOf(topProp)).not.toBe(-1);
    expect(room.familiars.length).toEqual(countFamiliars - 1);
    expect(room.props.length).toEqual(countProps - 1);
    expect(room.activePlayer).toEqual(activePlayer);
    expect(room.sendInfo).toHaveBeenCalledTimes(1);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок otherPlayer подключился');
  });

  test('Подключается существующий игрок', async () => {
    spyOn(room, 'wsSendMessageAsync').mockImplementation(async () => {});
    const countFamiliars = room.familiars.length;
    const countProps = room.props.length;

    await joinPlayer({
      room,
      roomName: room.name,
      nickname: 'activePlayer',
      wss: {} as WebSocketServer,
      ws,
    });

    expect(wsClients[room.name].activePlayer).toEqual(ws);
    expect(room.players.activePlayer).toEqual(activePlayer);
    expect(room.familiars.length).toEqual(countFamiliars);
    expect(room.props.length).toEqual(countProps);
    expect(room.activePlayer).toEqual(activePlayer);
    expect(room.sendInfo).toHaveBeenCalledTimes(1);
    expect(room.wsSendMessageAsync).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer подключился');
  });

  test('Создается новая коната', async () => {
    const wss = {} as WebSocketServer;

    const countFamiliars = Object.values(cardMap[ECardTypes.familiars]).length;
    const countProps = Object.values(propMap).length;

    const wsSendMessageAsyncSpy = spyOn(Room.prototype, 'wsSendMessageAsync')
      .mockImplementation(
        async (
          nickname,
          msg,
          // @ts-expect-error неопределенность типов
        ) => ({ prop: msg.data?.props[0], familiar: msg.data?.familiars[0] }),
      );
    const wsSendMessageSpy = spyOn(Room.prototype, 'wsSendMessage').mockImplementation(jest.fn);
    const sendInfoSpy = spyOn(Room.prototype, 'sendInfo').mockImplementation(jest.fn);
    const logEventSpy = spyOn(Room.prototype, 'logEvent').mockImplementation(jest.fn);

    await joinPlayer({
      roomName: '1',
      nickname: 'activePlayer',
      wss,
      ws,
    });

    const newRoom = rooms['1'];

    expect(wsClients['1'].activePlayer).toEqual(ws);
    expect(newRoom.players.activePlayer.nickname).toBe('activePlayer');
    expect(newRoom.familiars.length).toEqual(countFamiliars - 1);
    expect(newRoom.props.length).toEqual(countProps - 1);
    expect(newRoom.activePlayer.nickname).toEqual('activePlayer');
    expect(newRoom.admin.nickname).toEqual('activePlayer');
    // + 1 в fillShop
    expect(newRoom.sendInfo).toHaveBeenCalledTimes(2);
    expect(newRoom.wsSendMessageAsync).toHaveBeenCalledTimes(1);
    expect(newRoom.logEvent).toHaveBeenCalledWith('Игрок activePlayer подключился');

    wsSendMessageAsyncSpy.mockRestore();
    wsSendMessageSpy.mockRestore();
    sendInfoSpy.mockRestore();
    logEventSpy.mockRestore();
    delete rooms['1'];
  });

  test('Нельзя подключиться к законченной игре', async () => {
    const countFamiliars = room.familiars.length;
    const countProps = room.props.length;

    room.gameEnded = true;

    await joinPlayer({
      room,
      roomName: room.name,
      nickname: 'activePlayer',
      wss: {} as WebSocketServer,
      ws,
    });

    expect(wsClients[room.name].activePlayer).toBeUndefined();
    expect(room.players.activePlayer).toEqual(activePlayer);
    expect(room.familiars.length).toEqual(countFamiliars);
    expect(room.props.length).toEqual(countProps);
    expect(room.activePlayer).toEqual(activePlayer);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.wsSendMessageAsync).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
    expect(ws.close).toHaveBeenCalledWith(1000, 'Игра окончена');
    expect(console.error).toHaveBeenCalledWith('Ошибка созданиия игрока', new Error('Игра окончена'));
  });

  test('Нельзя подключиться, если сессия игрока уже есть', async () => {
    const countFamiliars = room.familiars.length;
    const countProps = room.props.length;

    wsClients[room.name].activePlayer = ws;

    await joinPlayer({
      room,
      roomName: room.name,
      nickname: 'activePlayer',
      wss: {} as WebSocketServer,
      ws,
    });

    expect(wsClients[room.name].activePlayer).toEqual(ws);
    expect(room.players.activePlayer).toEqual(activePlayer);
    expect(room.familiars.length).toEqual(countFamiliars);
    expect(room.props.length).toEqual(countProps);
    expect(room.activePlayer).toEqual(activePlayer);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.wsSendMessageAsync).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
    expect(ws.close).toHaveBeenCalledWith(1000, 'Пользователь с таким ником уже в игре');
    expect(console.error).toHaveBeenCalledWith('Ошибка созданиия игрока', new Error('Пользователь с таким ником уже в игре'));
  });

  test('Нельзя подключиться, если игроков уже 5', async () => {
    wsClients[room.name] = {
      1: {} as WebSocket,
      2: {} as WebSocket,
      3: {} as WebSocket,
      4: {} as WebSocket,
      5: {} as WebSocket,
    };

    await joinPlayer({
      room,
      roomName: room.name,
      nickname: 'activePlayer',
      wss: {} as WebSocketServer,
      ws,
    });

    expect(Object.values(wsClients[room.name]).length).toBe(5);
    expect(room.players.activePlayer).toEqual(activePlayer);
    expect(room.activePlayer).toEqual(activePlayer);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.wsSendMessageAsync).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
    expect(ws.close).toHaveBeenCalledWith(1000, 'Игроков уже 5');
    expect(console.error).toHaveBeenCalledWith('Ошибка созданиия игрока', new Error('Игроков уже 5'));
  });
});
