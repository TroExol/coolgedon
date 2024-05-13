import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;

describe('wizards 11', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let wizard11: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    activePlayer.hand = [];
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    wizard11 = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][11]);
    testHelper.giveCardToPlayer(wizard11, activePlayer);
  });

  test('Разыгрывается', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]); // cost 5
    otherPlayer.hand.push(card);

    spyOn(activePlayer, 'selectTarget').mockResolvedValue(otherPlayer);
    spyOn(otherPlayer, 'selectCards').mockResolvedValue({ cards: [card] });

    await wizard11.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard11.played).toBeTruthy();
    expect(otherPlayer.hand.length).toBe(5);
    expect(otherPlayer.hand.includes(card)).toBeFalsy();
    expect(otherPlayer.discard.length).toBe(1);
    expect(otherPlayer.discard.includes(card)).toBeTruthy();
    expect(otherPlayer.hp).toBe(20);
    expect(activePlayer.hp).toBe(20);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Разыгрывается, если нет карт для выбора', async () => {
    spyOn(activePlayer, 'selectTarget').mockResolvedValue(otherPlayer);

    await wizard11.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard11.played).toBeTruthy();
    expect(otherPlayer.hand.length).toBe(5);
    expect(otherPlayer.discard.length).toBe(0);
    expect(otherPlayer.hp).toBe(20);
    expect(activePlayer.hp).toBe(20);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Защитился', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]); // cost 5
    otherPlayer.hand.push(card);

    spyOn(activePlayer, 'selectTarget').mockResolvedValue(otherPlayer);
    spyOn(otherPlayer, 'selectCards').mockResolvedValue({ cards: [card] });
    spyOn(otherPlayer, 'guard').mockResolvedValue(false);

    await wizard11.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard11.played).toBeTruthy();
    expect(otherPlayer.hand.length).toBe(6);
    expect(otherPlayer.discard.length).toBe(0);
    expect(otherPlayer.hp).toBe(15);
    expect(activePlayer.hp).toBe(20);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не защищается, если нельзя', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]); // cost 5
    otherPlayer.hand.push(card);

    spyOn(activePlayer, 'selectTarget').mockResolvedValue(otherPlayer);
    spyOn(otherPlayer, 'selectCards').mockResolvedValue({ cards: [card] });
    spyOn(otherPlayer, 'guard').mockResolvedValue(false);

    await wizard11.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(wizard11.played).toBeTruthy();
    expect(otherPlayer.hand.length).toBe(5);
    expect(otherPlayer.hand.includes(card)).toBeFalsy();
    expect(otherPlayer.discard.length).toBe(1);
    expect(otherPlayer.discard.includes(card)).toBeTruthy();
    expect(otherPlayer.hp).toBe(20);
    expect(activePlayer.hp).toBe(20);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не разыгрывается, если не выбрана цель', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]); // cost 5
    otherPlayer.hand.push(card);

    spyOn(activePlayer, 'selectTarget').mockResolvedValue(undefined);
    spyOn(otherPlayer, 'guard');

    await wizard11.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard11.played).toBeFalsy();
    expect(otherPlayer.hand.length).toBe(6);
    expect(otherPlayer.discard.length).toBe(0);
    expect(otherPlayer.hp).toBe(20);
    expect(activePlayer.hp).toBe(20);
    expect(activePlayer.totalPower).toBe(0);
  });
});
