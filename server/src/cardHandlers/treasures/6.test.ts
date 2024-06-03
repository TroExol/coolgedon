import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('treasures 6', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let treasure6: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    treasure6 = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][6]);
    testHelper.giveCardToPlayer(treasure6, activePlayer);
  });

  test('Разыгрывается и передает карту из руки', async () => {
    const cost0Card = activePlayer.hand.find(card => card.getTotalCost(activePlayer) === 0)!;
    cost0Card.data = { description: 'Из руки', from: 'hand' };

    const selectCardsSpy = spyOn(activePlayer, 'selectCards').mockResolvedValue({ cards: [cost0Card], variant: 'otherPlayer' });
    const guardSpy = spyOn(otherPlayer, 'guard');

    await treasure6.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(treasure6.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.hand.includes(cost0Card)).toBeFalsy();
    expect(otherPlayer.hand.includes(cost0Card)).toBeTruthy();
    expect(cost0Card.ownerNickname).toBe(otherPlayer.nickname);
    expect(cost0Card.data).toBeUndefined();
    expect(selectCardsSpy.mock.calls[0][0].cards.includes(treasure6)).toBeFalsy();
    expect(selectCardsSpy.mock.calls[0][0].cards.includes(cost0Card)).toBeTruthy();
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(guardSpy.mock.results[0]).toBeTruthy();
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Разыгрывается и передает карту из сброса', async () => {
    const cost0Card = testHelper.createMockCard(room, cardMap[ECardTypes.seeds][1]);
    cost0Card.data = { description: 'Из сброса', from: 'discard' };
    cost0Card.ownerNickname = activePlayer.nickname;
    activePlayer.discard = [cost0Card];

    const selectCardsSpy = spyOn(activePlayer, 'selectCards').mockResolvedValue({ cards: [cost0Card], variant: 'otherPlayer' });
    const guardSpy = spyOn(otherPlayer, 'guard');

    await treasure6.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(treasure6.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(7);
    expect(activePlayer.discard.length).toBe(0);
    expect(otherPlayer.hand.includes(cost0Card)).toBeTruthy();
    expect(cost0Card.ownerNickname).toBe(otherPlayer.nickname);
    expect(cost0Card.data).toBeUndefined();
    expect(selectCardsSpy.mock.calls[0][0].cards.includes(treasure6)).toBeFalsy();
    expect(selectCardsSpy.mock.calls[0][0].cards.includes(cost0Card)).toBeTruthy();
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(guardSpy.mock.results[0]).toBeTruthy();
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Разыгрывается, если нет карт для передачи', async () => {
    activePlayer.deck = [];
    activePlayer.hand = activePlayer.hand.filter(card => card === treasure6);

    const selectCardsSpy = spyOn(activePlayer, 'selectCards').mockResolvedValue({ cards: [], variant: 'otherPlayer' });
    spyOn(otherPlayer, 'guard');

    await treasure6.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(treasure6.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(1);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.deck.length).toBe(0);
    expect(otherPlayer.hand.length).toBe(5);
    expect(selectCardsSpy).toHaveBeenCalledTimes(0);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Защитился', async () => {
    const cost0Card = activePlayer.hand.find(card => card.getTotalCost(activePlayer) === 0)!;
    cost0Card.data = { description: 'Из руки', from: 'hand' };

    spyOn(activePlayer, 'selectCards').mockResolvedValue({ cards: [cost0Card], variant: 'otherPlayer' });
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await treasure6.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(treasure6.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(7);
    expect(activePlayer.hand.includes(cost0Card)).toBeTruthy();
    expect(otherPlayer.hand.includes(cost0Card)).toBeFalsy();
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Не защищается, если нельзя', async () => {
    const cost0Card = activePlayer.hand.find(card => card.getTotalCost(activePlayer) === 0)!;
    cost0Card.data = { description: 'Из руки', from: 'hand' };

    spyOn(activePlayer, 'selectCards').mockResolvedValue({ cards: [cost0Card], variant: 'otherPlayer' });
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await treasure6.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(treasure6.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.hand.includes(cost0Card)).toBeFalsy();
    expect(otherPlayer.hand.includes(cost0Card)).toBeTruthy();
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(0);
  });
});
