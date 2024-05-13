import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('places 3', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let place3: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    place3 = testHelper.createMockCard(room, cardMap[ECardTypes.places][3]);
    place3.ownerNickname = activePlayer.nickname;
    activePlayer.activePermanent = [place3];
  });

  test('Разыгрывается', async () => {
    await place3.play({ type: 'permanent' });

    expect(place3.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.totalPower).toBe(0);
  });
});
