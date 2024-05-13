import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('legends 5', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let legend5: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    legend5 = testHelper.createMockCard(room, cardMap[ECardTypes.legends][5]);
    testHelper.giveCardToPlayer(legend5, activePlayer);
  });

  test('Берутся заклинания', async () => {
    activePlayer.discard = [
      ...activePlayer.hand.filter(card => !card.theSameType(ECardTypes.legends)),
      testHelper.createMockCard(room, cardMap[ECardTypes.spells][3]),
      testHelper.createMockCard(room, cardMap[ECardTypes.spells][4]),
      testHelper.createMockCard(room, cardMap[ECardTypes.spells][5]),
    ];
    activePlayer.hand = activePlayer.hand.filter(card => card.theSameType(ECardTypes.legends));

    await legend5.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend5.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(4);
    expect(activePlayer.hand
      .filter(card => !card.theSameType(ECardTypes.legends))
      .every(card => card.theSameType(ECardTypes.spells))).toBeTruthy();
    expect(activePlayer.discard.length).toBe(5);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Добавляется мощь', async () => {
    await legend5.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend5.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.totalPower).toBe(2);
  });
});
