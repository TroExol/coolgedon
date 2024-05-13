import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('creature 1', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let creature1: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    creature1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    testHelper.giveCardToPlayer(creature1, activePlayer);
  });

  test('Разыгрывается', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]); // cost 5
    testHelper.giveCardToPlayer(card, otherPlayer);

    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);
    const guardSpy = spyOn(otherPlayer, 'guard');

    await creature1.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature1.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(15);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(guardSpy.mock.results[0]).toBeTruthy();
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Разыгрывается с 0 урона', async () => {
    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);
    spyOn(otherPlayer, 'guard');

    await creature1.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature1.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Защитился', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]); // cost 5
    testHelper.giveCardToPlayer(card, otherPlayer);

    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await creature1.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature1.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не защищается, если нельзя', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]); // cost 5
    testHelper.giveCardToPlayer(card, otherPlayer);

    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await creature1.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(creature1.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(15);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не разыгрывается, если не выбрана цель', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]); // cost 5
    testHelper.giveCardToPlayer(card, otherPlayer);

    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(undefined);
    spyOn(otherPlayer, 'guard');

    await creature1.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature1.played).toBeFalsy();
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(0);
  });
});
