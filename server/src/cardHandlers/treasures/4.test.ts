import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('treasures 4', () => {
  let room: Room;
  let activePlayer: Player;
  let leftPlayer: Player;
  let otherPlayer: Player;
  let rightPlayer: Player;
  let treasure4: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    leftPlayer = testHelper.createMockPlayer({ room, nickname: 'leftPlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    rightPlayer = testHelper.createMockPlayer({ room, nickname: 'rightPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, leftPlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    testHelper.addPlayerToRoom(room, rightPlayer);
    treasure4 = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][4]);
    testHelper.giveCardToPlayer(treasure4, activePlayer);
  });

  test('Разыгрывается', async () => {
    const guardSpy = spyOn(leftPlayer, 'guard');

    await treasure4.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(treasure4.played).toBeTruthy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(20);
    expect(leftPlayer.hp).toBe(15);
    expect(rightPlayer.hp).toBe(15);
    expect(leftPlayer.guard).toHaveBeenCalledTimes(1);
    expect(guardSpy.mock.results[0]).toBeTruthy();
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Защитился', async () => {
    spyOn(leftPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await treasure4.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(treasure4.played).toBeTruthy();
    expect(leftPlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(20);
    expect(rightPlayer.hp).toBe(15);
    expect(leftPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не защищается, если нельзя', async () => {
    spyOn(leftPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await treasure4.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(treasure4.played).toBeTruthy();
    expect(leftPlayer.hp).toBe(15);
    expect(otherPlayer.hp).toBe(20);
    expect(rightPlayer.hp).toBe(15);
    expect(leftPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Разыгрывается с 1 врагом', async () => {
    room.players = {
      activePlayer,
      leftPlayer,
    };

    await treasure4.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(treasure4.played).toBeTruthy();
    expect(activePlayer.hp).toBe(20);
    expect(leftPlayer.hp).toBe(15);
    expect(otherPlayer.hp).toBe(20);
    expect(rightPlayer.hp).toBe(20);
    expect(activePlayer.totalPower).toBe(2);
  });
});
