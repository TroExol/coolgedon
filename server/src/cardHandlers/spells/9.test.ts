import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('spells 9', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let spell9: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    spell9 = testHelper.createMockCard(room, cardMap[ECardTypes.spells][9]);
    testHelper.giveCardToPlayer(spell9, activePlayer);
  });

  test('Разыгрывается и берет карты', async () => {
    activePlayer.skulls = [
      testHelper.createMockSkull({ room, id: 14 }),
      testHelper.createMockSkull({ room, id: 14 }),
      testHelper.createMockSkull({ room, id: 14 }),
    ];

    await spell9.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(spell9.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(9);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Разыгрывается и дает мощь', async () => {
    activePlayer.skulls = [
      testHelper.createMockSkull({ room, id: 14 }),
      testHelper.createMockSkull({ room, id: 14 }),
    ];

    await spell9.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(spell9.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.totalPower).toBe(2);
  });
});
