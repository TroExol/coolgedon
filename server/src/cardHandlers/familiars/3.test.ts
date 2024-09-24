import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('familiars 3', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let familiar3: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    familiar3 = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][3]);
    testHelper.giveCardToPlayer(familiar3, activePlayer);
  });

  test('Уничтожает карту', async () => {
    const topCard = getLastElement(activePlayer.deck)!;

    const selectCardsSpy = spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [topCard] });

    await familiar3.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(familiar3.played).toBeTruthy();
    expect(selectCardsSpy.mock.calls[0][0].cards.length).toBe(2);
    expect(activePlayer.deck.length).toBe(4);
    expect(activePlayer.deck.indexOf(topCard)).toBe(-1);
    expect(room.removed.cards).toEqual([topCard]);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не уничтожает, если не выбрана карта', async () => {
    const topCard = getLastElement(activePlayer.deck)!;

    const selectCardsSpy = spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

    await familiar3.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(familiar3.played).toBeTruthy();
    expect(selectCardsSpy.mock.calls[0][0].cards.length).toBe(2);
    expect(activePlayer.deck.length).toBe(5);
    expect(activePlayer.deck.indexOf(topCard)).not.toBe(-1);
    expect(room.removed.cards.length).toBe(0);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Замешивает колоду, если карт в колоде < 2 и уничтожает', async () => {
    activePlayer.discard = [...activePlayer.deck.splice(1)];
    const topCard = getLastElement(activePlayer.discard)!;

    const selectCardsSpy = spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [topCard] });

    await familiar3.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(familiar3.played).toBeTruthy();
    expect(selectCardsSpy.mock.calls[0][0].cards.length).toBe(2);
    expect(activePlayer.deck.length).toBe(4);
    expect(activePlayer.deck.indexOf(topCard)).toBe(-1);
    expect(room.removed.cards).toEqual([topCard]);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Просто помечается разыгранной, если нет сброса и колоды', async () => {
    activePlayer.deck = [];

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

    await familiar3.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(familiar3.played).toBeTruthy();
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.deck.length).toBe(0);
    expect(room.removed.cards.length).toBe(0);
    expect(activePlayer.selectCards).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(2);
  });
});
