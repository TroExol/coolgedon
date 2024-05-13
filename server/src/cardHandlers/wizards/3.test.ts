import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('wizards 3', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let otherPlayer2: Player;
  let wizard3: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    otherPlayer2 = testHelper.createMockPlayer({ room, nickname: 'otherPlayer2', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    testHelper.addPlayerToRoom(room, otherPlayer2);
    wizard3 = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][3]);
    testHelper.giveCardToPlayer(wizard3, activePlayer);
  });

  test('Разыгрывается', async () => {
    const guardSpy = spyOn(otherPlayer, 'guard');

    await wizard3.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard3.played).toBeTruthy();
    expect(activePlayer.hp).toBe(22);
    expect(otherPlayer.hp).toBe(15);
    expect(otherPlayer2.hp).toBe(15);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(guardSpy.mock.results[0]).toBeTruthy();
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Разыгрывается для 1 игрока', async () => {
    otherPlayer2.hp = 22;

    const guardSpy = spyOn(otherPlayer, 'guard');

    await wizard3.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard3.played).toBeTruthy();
    expect(activePlayer.hp).toBe(22);
    expect(otherPlayer.hp).toBe(15);
    expect(otherPlayer2.hp).toBe(22);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(guardSpy.mock.results[0]).toBeTruthy();
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Разыгрывается и не наносит урон', async () => {
    otherPlayer.hp = 23;
    otherPlayer2.hp = 23;

    spyOn(otherPlayer, 'guard');

    await wizard3.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard3.played).toBeTruthy();
    expect(activePlayer.hp).toBe(22);
    expect(otherPlayer.hp).toBe(23);
    expect(otherPlayer2.hp).toBe(23);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Защитился', async () => {
    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await wizard3.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard3.played).toBeTruthy();
    expect(activePlayer.hp).toBe(22);
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer2.hp).toBe(15);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не защищается, если нельзя', async () => {
    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await wizard3.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(wizard3.played).toBeTruthy();
    expect(activePlayer.hp).toBe(22);
    expect(otherPlayer.hp).toBe(15);
    expect(otherPlayer2.hp).toBe(15);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(2);
  });
});
