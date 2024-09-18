import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('lawlessnesses 7', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let lawlessness7: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    lawlessness7 = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][7]);
  });

  test('Разыгрывается', async () => {
    const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]); // cost 5
    activePlayer.deck.push(card1, card2);
    const topOtherPlayerDeckCard = getLastElement(otherPlayer.deck)!;

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [card1] });
    spyOn(otherPlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [topOtherPlayerDeckCard] });

    await lawlessness7.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness7.played).toBeFalsy();
    expect(activePlayer.hp).toBe(15);
    expect(otherPlayer.hp).toBe(20);
    expect(activePlayer.deck.some(card => [card1, card2].includes(card))).toBeFalsy();
    expect(activePlayer.hand.includes(card2)).toBeTruthy();
    expect(activePlayer.hand.includes(card1)).toBeFalsy();
    expect(otherPlayer.deck.includes(topOtherPlayerDeckCard)).toBeFalsy();
    expect(otherPlayer.hand.length).toBe(6);
    expect(room.removed.cards.length).toBe(2);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Защитился', async () => {
    spyOn(activePlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await lawlessness7.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness7.played).toBeFalsy();
    expect(activePlayer.deck.length).toBe(5);
    expect(otherPlayer.deck.length).toBe(5);
    expect(activePlayer.hand.length).toBe(5);
    expect(otherPlayer.hand.length).toBe(5);
    expect(activePlayer.guard).toHaveBeenCalledTimes(1);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(room.removed.cards.length).toBe(0);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Замешивается колода и разыгрывается', async () => {
    const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]); // cost 5
    activePlayer.discard = [card1, card2];
    activePlayer.deck = [];
    otherPlayer.discard = [card1, card2];
    otherPlayer.deck = [];

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [card1] });
    spyOn(otherPlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [card2] });

    await lawlessness7.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness7.played).toBeFalsy();
    expect(activePlayer.discard.length).toBe(0);
    expect(otherPlayer.discard.length).toBe(0);
    expect(activePlayer.deck.length).toBe(0);
    expect(otherPlayer.deck.length).toBe(0);
    expect(activePlayer.hand.includes(card1)).toBeFalsy();
    expect(activePlayer.hand.includes(card2)).toBeTruthy();
    expect(otherPlayer.hand.includes(card2)).toBeFalsy();
    expect(otherPlayer.hand.includes(card1)).toBeTruthy();
    expect(room.removed.cards.length).toBe(2);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Не разыгрывается, если нет колоды и сброса', async () => {
    activePlayer.deck = [];
    otherPlayer.deck = [];

    spyOn(activePlayer, 'selectCards');
    spyOn(otherPlayer, 'selectCards');

    await lawlessness7.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness7.played).toBeFalsy();
    expect(activePlayer.discard.length).toBe(0);
    expect(otherPlayer.discard.length).toBe(0);
    expect(activePlayer.deck.length).toBe(0);
    expect(otherPlayer.deck.length).toBe(0);
    expect(activePlayer.hand.length).toBe(5);
    expect(otherPlayer.hand.length).toBe(5);
    expect(room.removed.cards.length).toBe(0);
    expect(activePlayer.totalPower).toBe(0);
  });
});
