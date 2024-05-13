import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('treasures 9', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let treasure9: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    treasure9 = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][9]);
    testHelper.giveCardToPlayer(treasure9, activePlayer);
  });

  test('Разыгрывается', async () => {
    activePlayer.deck.push(testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1])); // cost 4

    await treasure9.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(treasure9.played).toBeTruthy();
    expect(activePlayer.hp).toBe(24);
    expect(activePlayer.totalPower).toBe(3);
  });

  test('Разыгрывается с 0 стоимостью', async () => {
    await treasure9.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(treasure9.played).toBeTruthy();
    expect(activePlayer.hp).toBe(20);
    expect(activePlayer.totalPower).toBe(3);
  });

  test('Замешивает колоду и разыгрывается', async () => {
    activePlayer.discard = [testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1])]; // cost 4
    activePlayer.deck = [];

    await treasure9.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(treasure9.played).toBeTruthy();
    expect(activePlayer.deck.length).toBe(1);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.hp).toBe(24);
    expect(activePlayer.totalPower).toBe(3);
  });

  test('Разыгрывается без колоды и сброса', async () => {
    activePlayer.deck = [];

    await treasure9.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(treasure9.played).toBeTruthy();
    expect(activePlayer.deck.length).toBe(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.hp).toBe(20);
    expect(activePlayer.totalPower).toBe(3);
  });
});
