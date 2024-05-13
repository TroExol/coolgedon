import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('creature 4', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let creature4: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    creature4 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][4]);
    testHelper.giveCardToPlayer(creature4, activePlayer);
  });

  test('Разыгрывается', async () => {
    await creature4.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature4.played).toBeTruthy();
    expect(activePlayer.deck.length).toBe(3);
    expect(activePlayer.hand.length).toBe(8);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Не берет карты, если их нет', async () => {
    activePlayer.deck = [];

    await creature4.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature4.played).toBeTruthy();
    expect(activePlayer.deck.length).toBe(0);
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.totalPower).toBe(0);
  });
});
