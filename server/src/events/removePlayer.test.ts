import type { WebSocket } from 'ws';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';

import * as testHelper from 'Helpers/tests';
import { removePlayer } from 'Event/removePlayer';
import * as endTurnEvent from 'Event/endTurn';
import { rooms, wsClients } from 'Entity/room';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('removePlayer', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let wsActivePlayer: WebSocket;
  let wsOtherPlayer: WebSocket;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    wsActivePlayer = {} as WebSocket;
    wsActivePlayer.close = fn();
    wsOtherPlayer = {} as WebSocket;
    wsOtherPlayer.close = fn();
    wsClients[room.name] = {
      activePlayer: wsActivePlayer,
      otherPlayer: wsOtherPlayer,
    };
    spyOn(room, 'logEvent');
    spyOn(room, 'sendInfo');
  });

  afterEach(() => {
    delete wsClients[room.name];
  });

  test('Удаляет активного игрока', () => {
    const endTurnSpy = spyOn(endTurnEvent, 'endTurn');

    removePlayer({ room, nickname: activePlayer.nickname });

    expect(room.playersArray).toEqual([otherPlayer]);
    expect(room.activePlayer).toEqual(otherPlayer);
    expect(room.admin).toEqual(otherPlayer);
    expect(wsClients[room.name].activePlayer).toBeUndefined();
    expect(wsClients[room.name].otherPlayer).toEqual(wsOtherPlayer);
    expect(wsActivePlayer.close).toHaveBeenCalledWith(1000, 'Вас исключили');
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer удален из игры');
    expect(room.sendInfo).toHaveBeenCalledTimes(2);
    expect(endTurnSpy).toHaveBeenCalledTimes(1);

    endTurnSpy.mockRestore();
  });

  test('Удаляет неактивного игрока', () => {
    const endTurnSpy = spyOn(endTurnEvent, 'endTurn');

    removePlayer({ room, nickname: otherPlayer.nickname });

    expect(room.playersArray).toEqual([activePlayer]);
    expect(room.activePlayer).toEqual(activePlayer);
    expect(room.admin).toEqual(activePlayer);
    expect(wsClients[room.name].otherPlayer).toBeUndefined();
    expect(wsClients[room.name].activePlayer).toEqual(wsActivePlayer);
    expect(wsOtherPlayer.close).toHaveBeenCalledWith(1000, 'Вас исключили');
    expect(room.logEvent).toHaveBeenCalledWith('Игрок otherPlayer удален из игры');
    expect(room.sendInfo).toHaveBeenCalledTimes(1);
    expect(endTurnSpy).toHaveBeenCalledTimes(0);

    endTurnSpy.mockRestore();
  });

  test('Не удаляет, если игрока нет', () => {
    const endTurnSpy = spyOn(endTurnEvent, 'endTurn');

    removePlayer({ room, nickname: 'das' });

    expect(room.playersArray).toEqual([activePlayer, otherPlayer]);
    expect(room.activePlayer).toEqual(activePlayer);
    expect(room.admin).toEqual(activePlayer);
    expect(wsClients[room.name].otherPlayer).toEqual(wsOtherPlayer);
    expect(wsClients[room.name].activePlayer).toEqual(wsActivePlayer);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(endTurnSpy).toHaveBeenCalledTimes(0);

    endTurnSpy.mockRestore();
  });

  test('Очищает комнату, если игроков нет', () => {
    rooms[room.name] = room;
    room.players = {};
    const endTurnSpy = spyOn(endTurnEvent, 'endTurn');

    removePlayer({ room, nickname: 'das' });

    expect(wsClients[room.name]).toBeUndefined();
    expect(rooms[room.name]).toBeUndefined();
    expect(room.logEvent).toHaveBeenCalledTimes(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(endTurnSpy).toHaveBeenCalledTimes(0);

    endTurnSpy.mockRestore();
  });

  test('Очищает комнату, если игрок последний', () => {
    rooms[room.name] = room;
    delete room.players.otherPlayer;
    const endTurnSpy = spyOn(endTurnEvent, 'endTurn');

    removePlayer({ room, nickname: 'activePlayer' });

    expect(wsClients[room.name]).toBeUndefined();
    expect(rooms[room.name]).toBeUndefined();
    expect(room.logEvent).toHaveBeenCalledTimes(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(endTurnSpy).toHaveBeenCalledTimes(0);

    endTurnSpy.mockRestore();
  });
});
