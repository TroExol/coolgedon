import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;

describe('wizards 6', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let wizard6: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    activePlayer.hand = [];
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    wizard6 = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][6]);
    testHelper.giveCardToPlayer(wizard6, activePlayer);
  });

  test('Разыгрывается', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]); // cost 4
    otherPlayer.deck.push(card);

    spyOn(activePlayer, 'selectTarget').mockResolvedValue(otherPlayer);

    await wizard6.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard6.played).toBeTruthy();
    expect(otherPlayer.deck.length).toBe(6);
    expect(otherPlayer.hp).toBe(16);
    expect(activePlayer.hp).toBe(20);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Разыгрывается с 0 урона', async () => {
    spyOn(activePlayer, 'selectTarget').mockResolvedValue(otherPlayer);

    await wizard6.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard6.played).toBeTruthy();
    expect(otherPlayer.deck.length).toBe(5);
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(20);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Разыгрывается, если нет карт', async () => {
    otherPlayer.deck = [];

    spyOn(activePlayer, 'selectTarget').mockResolvedValue(otherPlayer);

    await wizard6.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard6.played).toBeTruthy();
    expect(otherPlayer.deck.length).toBe(0);
    expect(otherPlayer.discard.length).toBe(0);
    expect(otherPlayer.hp).toBe(20);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Защитился', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]); // cost 4
    otherPlayer.deck.push(card);

    spyOn(activePlayer, 'selectTarget').mockResolvedValue(otherPlayer);
    spyOn(otherPlayer, 'guard').mockResolvedValue(false);

    await wizard6.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard6.played).toBeTruthy();
    expect(otherPlayer.deck.length).toBe(6);
    expect(otherPlayer.discard.length).toBe(0);
    expect(otherPlayer.hp).toBe(20);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не защищается, если нельзя', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]); // cost 4
    otherPlayer.deck.push(card);

    spyOn(activePlayer, 'selectTarget').mockResolvedValue(otherPlayer);
    spyOn(otherPlayer, 'guard').mockResolvedValue(false);

    await wizard6.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(wizard6.played).toBeTruthy();
    expect(otherPlayer.deck.length).toBe(6);
    expect(otherPlayer.discard.length).toBe(0);
    expect(otherPlayer.hp).toBe(16);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не разыгрывается, если не выбрана цель', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]); // cost 4
    otherPlayer.deck.push(card);

    spyOn(activePlayer, 'selectTarget').mockResolvedValue(undefined);
    spyOn(otherPlayer, 'guard');

    await wizard6.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard6.played).toBeFalsy();
    expect(otherPlayer.deck.length).toBe(6);
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Замешивает колоду и разыгрывает', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]); // cost 4
    otherPlayer.discard = [card];
    otherPlayer.deck = [];

    spyOn(activePlayer, 'selectTarget').mockResolvedValue(otherPlayer);

    await wizard6.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard6.played).toBeTruthy();
    expect(otherPlayer.deck.length).toBe(1);
    expect(otherPlayer.discard.length).toBe(0);
    expect(otherPlayer.hp).toBe(16);
    expect(activePlayer.totalPower).toBe(2);
  });
});
