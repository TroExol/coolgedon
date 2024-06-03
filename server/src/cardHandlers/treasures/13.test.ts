import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('treasures 13', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let treasure13: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    treasure13 = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][13]);
    treasure13.ownerNickname = activePlayer.nickname;
    activePlayer.activePermanent = [treasure13];
  });

  test('Разыгрывается без обработчика', async () => {
    await treasure13.play({ type: 'permanent' });

    expect(treasure13.played).toBeFalsy();
    expect(activePlayer.hand.length).toBe(5);
    expect(activePlayer.activePermanent.length).toBe(1);
    expect(activePlayer.activePermanent.includes(treasure13)).toBeTruthy();
    expect(activePlayer.totalPower).toBe(0);
  });
});
