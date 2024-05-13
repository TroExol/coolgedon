import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('spells 13', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let otherPlayer2: Player;
  let spell13: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'leftPlayer', prop: prop4 });
    otherPlayer2 = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    testHelper.addPlayerToRoom(room, otherPlayer2);
    spell13 = testHelper.createMockCard(room, cardMap[ECardTypes.spells][13]);
    testHelper.giveCardToPlayer(spell13, activePlayer);
  });

  test('Разыгрывается', async () => {
    const guardSpy = spyOn(otherPlayer, 'guard');

    await spell13.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(spell13.played).toBeTruthy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(13);
    expect(otherPlayer2.hp).toBe(13);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(guardSpy.mock.results[0]).toBeTruthy();
    expect(activePlayer.totalPower).toBe(3);
  });

  test('Защитился', async () => {
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await spell13.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(spell13.played).toBeTruthy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer2.hp).toBe(13);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(3);
  });

  test('Не защищается, если нельзя', async () => {
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await spell13.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(spell13.played).toBeTruthy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(13);
    expect(otherPlayer2.hp).toBe(13);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(3);
  });
});
