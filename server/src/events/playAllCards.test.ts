import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';

import * as testHelper from 'Helpers/tests';
import { playAllCards } from 'Event/playAllCards';
import { Card } from 'Entity/card';

import spyOn = jest.spyOn;

describe('playAllCards', () => {
  let room: Room;
  let activePlayer: Player;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
    testHelper.addPlayerToRoom(room, activePlayer);
  });

  test('Разыгрываются все карты в руке', async () => {
    const playSpy = spyOn(Card.prototype, 'play').mockImplementation(async () => {});

    await playAllCards(room);

    expect(playSpy).toHaveBeenCalledTimes(5);

    playSpy.mockRestore();
  });
});
