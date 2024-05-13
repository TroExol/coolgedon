import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';

import spyOn = jest.spyOn;

describe('wizards 9', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let wizard9: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    wizard9 = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][9]);
    testHelper.giveCardToPlayer(wizard9, activePlayer);
  });

  test('Разыгрывается и берет карту', async () => {
    const topCard = getLastElement(activePlayer.deck)!;

    spyOn(activePlayer, 'selectCards').mockResolvedValue({ cards: [topCard], variant: 1 });

    await wizard9.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard9.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(7);
    expect(activePlayer.hand.includes(topCard)).toBeTruthy();
    expect(activePlayer.deck.includes(topCard)).toBeFalsy();
    expect(activePlayer.deck.length).toBe(4);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Разыгрывается и ничтожает карту', async () => {
    const topCard = getLastElement(activePlayer.deck)!;

    spyOn(activePlayer, 'selectCards').mockResolvedValue({ cards: [topCard], variant: 2 });

    await wizard9.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard9.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.hand.includes(topCard)).toBeFalsy();
    expect(activePlayer.deck.includes(topCard)).toBeFalsy();
    expect(activePlayer.deck.length).toBe(4);
    expect(activePlayer.discard.length).toBe(0);
    expect(room.removed.cards).toEqual([topCard]);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Замешивает колоду и разыгрывает', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]); // cost 4
    activePlayer.discard = [card];
    activePlayer.deck = [];

    spyOn(activePlayer, 'selectCards').mockResolvedValue({ cards: [card], variant: 1 });

    await wizard9.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard9.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(7);
    expect(activePlayer.hand.includes(card)).toBeTruthy();
    expect(activePlayer.deck.includes(card)).toBeFalsy();
    expect(activePlayer.deck.length).toBe(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.totalPower).toBe(0);
  });
});
