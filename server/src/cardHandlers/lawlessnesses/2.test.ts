import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('lawlessnesses 2', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let lawlessness2: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    lawlessness2 = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][2]);
  });

  test('Разыгрывается', async () => {
    activePlayer.hp = 10;
    spyOn(activePlayer, 'guard');
    spyOn(otherPlayer, 'guard');

    await lawlessness2.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness2.played).toBeFalsy();
    expect(activePlayer.hp).toBe(5);
    expect(otherPlayer.hp).toBe(15);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Защитился', async () => {
    spyOn(activePlayer, 'guard');
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await lawlessness2.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness2.played).toBeFalsy();
    expect(activePlayer.hp).toBe(15);
    expect(otherPlayer.hp).toBe(20);
    expect(activePlayer.guard).toHaveBeenCalledTimes(1);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Не наносит урон игроку < 10 хп', async () => {
    activePlayer.hp = 9;

    spyOn(activePlayer, 'guard');
    spyOn(otherPlayer, 'guard');

    await lawlessness2.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness2.played).toBeFalsy();
    expect(activePlayer.hp).toBe(9);
    expect(otherPlayer.hp).toBe(15);
    expect(activePlayer.guard).toHaveBeenCalledTimes(0);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(0);
  });
});
