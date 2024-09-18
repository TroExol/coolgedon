import type { Room } from 'Entity/room';

import * as testHelper from 'Helpers/tests';
import { removeRoom } from 'Event/removeRoom';
import { rooms } from 'Entity/room';

const spyOn = jest.spyOn;

describe('removeRoom', () => {
  let room: Room;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    rooms[room.name] = room;
    spyOn(room, 'close');
  });

  afterEach(() => {
    delete rooms[room.name];
  });

  test('Удаляет комнату', () => {
    removeRoom(room);

    expect(rooms[room.name]).toBeUndefined();
    expect(room.close).toHaveBeenCalledTimes(1);
  });
});
