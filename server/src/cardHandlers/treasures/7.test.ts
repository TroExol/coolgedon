import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('treasures 7', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let treasure7: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    treasure7 = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][7]);
    testHelper.giveCardToPlayer(treasure7, activePlayer);
  });

  test('Разыгрывается', async () => {
    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);
    const guardSpy = spyOn(otherPlayer, 'guard');

    await treasure7.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(treasure7.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(17);
    expect(otherPlayer.discard.length).toBe(1);
    expect(otherPlayer.discard[0].type).toBe(ECardTypes.sluggishStick);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(guardSpy.mock.results[0]).toBeTruthy();
    expect(activePlayer.totalPower).toBe(1);
  });

  test('Защитился', async () => {
    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await treasure7.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(treasure7.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer.discard.length).toBe(0);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(1);
  });

  test('Не защищается, если нельзя', async () => {
    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await treasure7.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(treasure7.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(17);
    expect(otherPlayer.discard.length).toBe(1);
    expect(otherPlayer.discard[0].type).toBe(ECardTypes.sluggishStick);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(1);
  });

  test('Разыгрывается даже если нет палок', async () => {
    room.sluggishStick = [];

    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await treasure7.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(treasure7.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(17);
    expect(otherPlayer.discard.length).toBe(0);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(1);
  });

  test('Не разыгрывается, если не выбрана цель', async () => {
    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(undefined);
    spyOn(otherPlayer, 'guard');

    await treasure7.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(treasure7.played).toBeFalsy();
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer.discard.length).toBe(0);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(0);
  });
});
