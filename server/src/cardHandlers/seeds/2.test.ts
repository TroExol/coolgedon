import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('seeds 2', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let seed2: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    seed2 = testHelper.createMockCard(room, cardMap[ECardTypes.seeds][2]);
    testHelper.giveCardToPlayer(seed2, activePlayer);
  });

  test('Разыгрывается', async () => {
    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);
    const guardSpy = spyOn(otherPlayer, 'guard');

    await seed2.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(seed2.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(6);
    expect(otherPlayer.hp).toBe(19);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(guardSpy.mock.results[0]).toBeTruthy();
    expect(activePlayer.totalPower).toBe(1);
  });

  test('Разыгрывается и берет карты при убийстве', async () => {
    otherPlayer.hp = 1;
    const skull = testHelper.createMockSkull({ room, id: 12 });
    room.skulls.push(skull);

    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);

    await seed2.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(seed2.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(8);
    expect(otherPlayer.hp).toBe(11);
    expect(activePlayer.totalPower).toBe(1);
  });

  test('Защитился', async () => {
    otherPlayer.hp = 1;

    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await seed2.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(seed2.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(6);
    expect(otherPlayer.hp).toBe(1);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(1);
  });

  test('Не защищается, если нельзя', async () => {
    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await seed2.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(seed2.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(19);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(1);
  });

  test('Не разыгрывается, если не выбрана цель', async () => {
    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(undefined);
    spyOn(otherPlayer, 'guard');

    await seed2.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(seed2.played).toBeFalsy();
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(0);
  });
});
