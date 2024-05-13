import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('treasures 2', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let treasures2: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'leftPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    treasures2 = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][2]);
    testHelper.giveCardToPlayer(treasures2, activePlayer);
  });

  test('Разыгрывается', async () => {
    await treasures2.play({ type: 'permanent' });

    expect(treasures2.played).toBeTruthy();
    expect(activePlayer.hp).toBe(23);
    expect(activePlayer.totalPower).toBe(0);
  });
});
