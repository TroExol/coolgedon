import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('spells 4', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let spell4: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    spell4 = testHelper.createMockCard(room, cardMap[ECardTypes.spells][4]);
    testHelper.giveCardToPlayer(spell4, activePlayer);
  });

  test('Разыгрывается', async () => {
    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);
    const guardSpy = spyOn(otherPlayer, 'guard');

    await spell4.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(spell4.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(15);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(guardSpy.mock.results[0]).toBeTruthy();
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Защитился', async () => {
    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await spell4.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(spell4.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не защищается, если нельзя', async () => {
    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(otherPlayer);
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await spell4.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(spell4.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(15);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не разыгрывается, если не выбрана цель', async () => {
    spyOn(activePlayer, 'selectTarget').mockImplementation(fn()).mockResolvedValue(undefined);
    spyOn(otherPlayer, 'guard');

    await spell4.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(spell4.played).toBeFalsy();
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(0);
  });
});
