/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Player } from 'Entity/player';

import * as testHelper from 'Helpers/tests';
import * as removeRoomEvent from 'Event/removeRoom';
import { removePlayer } from 'Event/removePlayer';
import * as endTurnEvent from 'Event/endTurn';
import { type Room, rooms } from 'Entity/room';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('removePlayer', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let socketActivePlayer: any;
  let socketOtherPlayer: any;
  let endTurnSpy: jest.SpyInstance;
  let removeRoomSpy: jest.SpyInstance;

  beforeEach(() => {
    endTurnSpy = spyOn(endTurnEvent, 'endTurn');
    removeRoomSpy = spyOn(removeRoomEvent, 'removeRoom');
    room = testHelper.createMockRoom('1', 'activePlayer');
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    socketActivePlayer = {};
    socketActivePlayer.disconnect = fn();
    socketOtherPlayer = {};
    socketOtherPlayer.disconnect = fn();
    room.addPlayerSocket(activePlayer.nickname, socketActivePlayer);
    room.addPlayerSocket(otherPlayer.nickname, socketOtherPlayer);
    spyOn(room, 'logEvent');
    spyOn(room, 'sendInfo');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Удаляет активного игрока', () => {
    removePlayer({ room, nickname: activePlayer.nickname });

    expect(room.playersArray).toEqual([otherPlayer]);
    expect(room.activePlayer).toEqual(otherPlayer);
    expect(room.admin).toEqual(otherPlayer);
    expect(room.getSocketClient(activePlayer.nickname)).toBeUndefined();
    expect(room.getSocketClient(otherPlayer.nickname)).toEqual(socketOtherPlayer);
    expect(socketActivePlayer.disconnect).toHaveBeenCalledTimes(1);
    expect(socketOtherPlayer.disconnect).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer удален из игры');
    expect(room.sendInfo).toHaveBeenCalledTimes(3);
    expect(endTurnSpy).toHaveBeenCalledTimes(1);
  });

  test('Удаляет неактивного игрока', () => {
    removePlayer({ room, nickname: otherPlayer.nickname });

    expect(room.playersArray).toEqual([activePlayer]);
    expect(room.activePlayer).toEqual(activePlayer);
    expect(room.admin).toEqual(activePlayer);
    expect(room.getSocketClient(otherPlayer.nickname)).toBeUndefined();
    expect(room.getSocketClient(activePlayer.nickname)).toEqual(socketActivePlayer);
    expect(socketOtherPlayer.disconnect).toHaveBeenCalledTimes(1);
    expect(socketActivePlayer.disconnect).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок otherPlayer удален из игры');
    expect(room.sendInfo).toHaveBeenCalledTimes(2);
    expect(endTurnSpy).toHaveBeenCalledTimes(0);
  });

  test('Не удаляет, если игрока нет', () => {
    removePlayer({ room, nickname: 'das' });

    expect(room.playersArray).toEqual([activePlayer, otherPlayer]);
    expect(room.activePlayer).toEqual(activePlayer);
    expect(room.admin).toEqual(activePlayer);
    expect(room.getSocketClient(otherPlayer.nickname)).toEqual(socketOtherPlayer);
    expect(room.getSocketClient(activePlayer.nickname)).toEqual(socketActivePlayer);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(endTurnSpy).toHaveBeenCalledTimes(0);
  });

  test('Очищает комнату, если игроков нет', () => {
    rooms[room.name] = room;
    room.players = {};

    removePlayer({ room, nickname: 'das' });

    expect(rooms[room.name]).toBeUndefined();
    expect(removeRoomSpy).toHaveBeenCalledTimes(1);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(endTurnSpy).toHaveBeenCalledTimes(0);
  });

  test('Очищает комнату, если игрок последний', () => {
    rooms[room.name] = room;
    delete room.players.otherPlayer;

    removePlayer({ room, nickname: 'activePlayer' });

    expect(rooms[room.name]).toBeUndefined();
    expect(removeRoomSpy).toHaveBeenCalledTimes(1);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(endTurnSpy).toHaveBeenCalledTimes(0);
  });
});
