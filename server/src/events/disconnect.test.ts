import type { WebSocket } from 'ws';

import type { Player } from 'Entity/player';

import * as testHelper from 'Helpers/tests';
import { disconnect } from 'Event/disconnect';
import { type Room, wsClients } from 'Entity/room';

import spyOn = jest.spyOn;

describe('disconnect', () => {
  let room: Room;
  let activePlayer: Player;
  let ws: WebSocket;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
    ws = {} as WebSocket;
    testHelper.addPlayerToRoom(room, activePlayer);
    wsClients[room.name] = {};
    wsClients[room.name][activePlayer.nickname] = ws;

    spyOn(room, 'logEvent');
  });

  afterEach(() => {
    delete wsClients[room.name][activePlayer.nickname];
    delete wsClients[room.name];
  });

  test('Удаление ws из комнаты при отключении', () => {
    disconnect({ room, nickname: activePlayer.nickname, ws });

    expect(wsClients[room.name][activePlayer.nickname]).toBeUndefined();
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer отключился');
  });

  test('Не удаляет ws из комнаты при отключении, если ws не совпадает', () => {
    disconnect({ room, nickname: activePlayer.nickname, ws: { isPaused: false } as WebSocket });

    expect(wsClients[room.name][activePlayer.nickname]).toEqual(ws);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
  });
});
