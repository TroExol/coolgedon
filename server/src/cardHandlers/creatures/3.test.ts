import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('creature 3', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let creature3: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    creature3 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][3]);
    testHelper.giveCardToPlayer(creature3, activePlayer);
  });

  test('Уничтожает карту', async () => {
    const topCard = getLastElement(activePlayer.deck)!;

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [topCard], variant: 1 });

    await creature3.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature3.played).toBeTruthy();
    expect(activePlayer.deck.length).toBe(4);
    expect(activePlayer.deck.indexOf(topCard)).toBe(-1);
    expect(room.removed.cards).toEqual([topCard]);
    expect(activePlayer.totalPower).toBe(1);
  });

  test('Оставляет карту', async () => {
    const topCard = getLastElement(activePlayer.deck)!;

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [topCard], variant: 2 });

    await creature3.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature3.played).toBeTruthy();
    expect(activePlayer.deck.length).toBe(5);
    expect(activePlayer.deck.indexOf(topCard)).not.toBe(-1);
    expect(room.removed.cards.length).toBe(0);
    expect(activePlayer.totalPower).toBe(1);
  });

  test('Замешивает колоду и уничтожает', async () => {
    activePlayer.discard = [...activePlayer.deck];
    activePlayer.deck = [];
    const topCard = getLastElement(activePlayer.discard)!;

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [topCard], variant: 1 });

    await creature3.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature3.played).toBeTruthy();
    expect(activePlayer.deck.length).toBe(4);
    expect(activePlayer.deck.indexOf(topCard)).toBe(-1);
    expect(room.removed.cards).toEqual([topCard]);
    expect(activePlayer.totalPower).toBe(1);
  });

  test('Просто помечается разыгранной, если нет сброса и колоды', async () => {
    activePlayer.deck = [];

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [], variant: 1 });

    await creature3.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature3.played).toBeTruthy();
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.deck.length).toBe(0);
    expect(room.removed.cards.length).toBe(0);
    expect(activePlayer.selectCards).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(1);
  });

  test('Не разыгрывается, если не выбран вариант', async () => {
    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

    await creature3.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature3.played).toBeFalsy();
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.deck.length).toBe(5);
    expect(room.removed.cards.length).toBe(0);
    expect(activePlayer.selectCards).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(0);
  });
});
