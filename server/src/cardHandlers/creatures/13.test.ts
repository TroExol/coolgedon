import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('creature 13', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let creature13: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    activePlayer.hand = [];
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    creature13 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][13]);
    testHelper.giveCardToPlayer(creature13, activePlayer);
  });

  test('Разыгрывается', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]); // cost 4
    otherPlayer.hand = [card];

    await creature13.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature13.played).toBeTruthy();
    expect(otherPlayer.hand.length).toBe(0);
    expect(otherPlayer.discard).toEqual([card]);
    expect(otherPlayer.hp).toBe(16);
    expect(activePlayer.hp).toBe(20);
  });

  test('Разыгрывается с 0 урона', async () => {
    await creature13.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature13.played).toBeTruthy();
    expect(otherPlayer.hand.length).toBe(4);
    expect(otherPlayer.discard.length).toBe(1);
    expect(otherPlayer.hp).toBe(20);
  });

  test('Разыгрывается, если нет карт', async () => {
    otherPlayer.hand = [];

    await creature13.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature13.played).toBeTruthy();
    expect(otherPlayer.hand.length).toBe(0);
    expect(otherPlayer.discard.length).toBe(0);
    expect(otherPlayer.hp).toBe(20);
  });
});
