import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Prop } from 'Entity/prop';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('familiars 4', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let familiar4: Card;
  let prop4: Prop;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    familiar4 = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][4]);
    testHelper.giveCardToPlayer(familiar4, activePlayer);
  });

  test('Разыгрывается', async () => {
    const guardSpy = spyOn(otherPlayer, 'guard');

    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);

    await familiar4.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(familiar4.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(13);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(guardSpy.mock.results[0]).toBeTruthy();
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Защитился', async () => {
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);
    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);

    await familiar4.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(familiar4.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не защищается, если нельзя', async () => {
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);
    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);

    await familiar4.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(familiar4.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(13);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не разыгрывается, если не выбран игрок', async () => {
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);
    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(undefined);

    await familiar4.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(familiar4.played).toBeFalsy();
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('При беспределе выбирает активный игрок выбирает игрока', async () => {
    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(true);

    await familiar4.play({ type: 'byLawlessness' });

    expect(familiar4.played).toBeFalsy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(13);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(0);
  });
});
