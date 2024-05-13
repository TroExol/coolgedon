import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('places 4', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let place4: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    place4 = testHelper.createMockCard(room, cardMap[ECardTypes.places][4]);
    place4.ownerNickname = activePlayer.nickname;
    activePlayer.activePermanent = [place4];
  });

  test('Разыгрывается', async () => {
    await place4.play({ type: 'permanent' });

    expect(place4.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.totalPower).toBe(0);
  });
});
