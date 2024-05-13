import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('spells 5', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let spell5: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    spell5 = testHelper.createMockCard(room, cardMap[ECardTypes.spells][5]);
    testHelper.giveCardToPlayer(spell5, activePlayer);
  });

  test('Разыгрывается', async () => {
    await spell5.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(spell5.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(7);
    expect(activePlayer.totalPower).toBe(0);
  });
});
