import type { Room } from 'Entity/room';

import * as testHelper from 'Helpers/tests';
import { reset } from 'Event/reset';
import { rooms, wsClients } from 'Entity/room';

describe('reset', () => {
  let room: Room;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    rooms[room.name] = room;
  });

  afterEach(() => {
    delete rooms[room.name];
    delete wsClients[room.name];
  });

  test('Удаляет комнату', () => {
    reset(room);

    expect(rooms[room.name]).toBeUndefined();
    expect(wsClients[room.name]).toBeUndefined();
  });
});
