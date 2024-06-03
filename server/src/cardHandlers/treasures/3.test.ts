import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('treasures 3', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let treasure3: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    treasure3 = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][3]);
    treasure3.ownerNickname = activePlayer.nickname;
    activePlayer.activePermanent = [treasure3];
  });

  test('Разыгрывается без обработчика', async () => {
    await treasure3.play({ type: 'permanent' });

    expect(treasure3.played).toBeFalsy();
    expect(activePlayer.hand.length).toBe(5);
    expect(activePlayer.activePermanent.length).toBe(1);
    expect(activePlayer.activePermanent.includes(treasure3)).toBeTruthy();
    expect(activePlayer.totalPower).toBe(0);
  });
});
