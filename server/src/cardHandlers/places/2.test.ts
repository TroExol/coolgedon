import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('places 2', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let place2: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    place2 = testHelper.createMockCard(room, cardMap[ECardTypes.places][2]);
    place2.ownerNickname = activePlayer.nickname;
    activePlayer.activePermanent = [place2];
  });

  test('Разыгрывается', async () => {
    await place2.play({ type: 'permanent' });

    expect(place2.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.totalPower).toBe(0);
  });
});
