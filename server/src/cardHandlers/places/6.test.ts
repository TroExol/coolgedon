import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('places 6', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let place6: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    place6 = testHelper.createMockCard(room, cardMap[ECardTypes.places][6]);
    place6.ownerNickname = activePlayer.nickname;
    activePlayer.activePermanent = [place6];
  });

  test('Разыгрывается без обработчика', async () => {
    await place6.play({ type: 'permanent' });

    expect(place6.played).toBeFalsy();
    expect(activePlayer.hand.length).toBe(5);
    expect(activePlayer.activePermanent.length).toBe(1);
    expect(activePlayer.activePermanent.includes(place6)).toBeTruthy();
    expect(activePlayer.totalPower).toBe(0);
  });
});
