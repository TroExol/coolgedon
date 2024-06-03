import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('places 5', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let place5: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    place5 = testHelper.createMockCard(room, cardMap[ECardTypes.places][5]);
    place5.ownerNickname = activePlayer.nickname;
    activePlayer.activePermanent = [place5];
  });

  test('Разыгрывается без обработчика', async () => {
    await place5.play({ type: 'permanent' });

    expect(place5.played).toBeFalsy();
    expect(activePlayer.hand.length).toBe(5);
    expect(activePlayer.activePermanent.length).toBe(1);
    expect(activePlayer.activePermanent.includes(place5)).toBeTruthy();
    expect(activePlayer.totalPower).toBe(0);
  });
});
