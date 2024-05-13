import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('legends 7', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let legend7: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    legend7 = testHelper.createMockCard(room, cardMap[ECardTypes.legends][7]);
    testHelper.giveCardToPlayer(legend7, activePlayer);
  });

  test('Берутся сокровища', async () => {
    activePlayer.discard = [
      ...activePlayer.hand.filter(card => !card.theSameType(ECardTypes.legends)),
      testHelper.createMockCard(room, cardMap[ECardTypes.treasures][1]),
      testHelper.createMockCard(room, cardMap[ECardTypes.treasures][4]),
      testHelper.createMockCard(room, cardMap[ECardTypes.treasures][5]),
    ];
    activePlayer.hand = activePlayer.hand.filter(card => card.theSameType(ECardTypes.legends));

    await legend7.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend7.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(4);
    expect(activePlayer.hand
      .filter(card => !card.theSameType(ECardTypes.legends))
      .every(card => card.theSameType(ECardTypes.treasures))).toBeTruthy();
    expect(activePlayer.discard.length).toBe(5);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Добавляется мощь', async () => {
    await legend7.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend7.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.totalPower).toBe(2);
  });
});
