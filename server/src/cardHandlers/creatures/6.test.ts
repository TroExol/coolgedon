import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Prop } from 'Entity/prop';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('creature 6', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let minHpPlayer: Player;
  let creature6: Card;
  let prop4: Prop;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    minHpPlayer = testHelper.createMockPlayer({ room, nickname: 'minHpPlayer', prop: prop4 });
    minHpPlayer.hp = 14;
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    testHelper.addPlayerToRoom(room, minHpPlayer);
    creature6 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][6]);
    testHelper.giveCardToPlayer(creature6, activePlayer);
  });

  test('Разыгрывается', async () => {
    const guardSpy = spyOn(minHpPlayer, 'guard');

    await creature6.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature6.played).toBeTruthy();
    expect(minHpPlayer.hp).toBe(10);
    expect(otherPlayer.hp).toBe(20);
    expect(minHpPlayer.guard).toHaveBeenCalledTimes(1);
    expect(guardSpy.mock.results[0]).toBeTruthy();
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Разыгрывается и предлагает выбрать жетон при убийстве', async () => {
    minHpPlayer.hp = 3;
    const skull1 = testHelper.createMockSkull({ room, id: 19 });
    const skull2 = testHelper.createMockSkull({ room, id: 19 });
    room.skulls = [skull1, skull2];

    spyOn(skull1, 'play').mockImplementation(fn()).mockResolvedValue(undefined);
    spyOn(activePlayer, 'selectSkulls').mockImplementation(fn()).mockResolvedValue({ skulls: [skull1] });
    spyOn(minHpPlayer, 'guard');

    await creature6.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature6.played).toBeTruthy();
    expect(minHpPlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(20);
    expect(minHpPlayer.skulls.length).toBe(1);
    expect(minHpPlayer.skulls.indexOf(skull1)).not.toBe(-1);
    expect(minHpPlayer.skulls[0].ownerNickname).toBe('minHpPlayer');
    expect(minHpPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Защитился', async () => {
    spyOn(minHpPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await creature6.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature6.played).toBeTruthy();
    expect(minHpPlayer.hp).toBe(14);
    expect(minHpPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не защищается, если нельзя', async () => {
    spyOn(minHpPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await creature6.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(creature6.played).toBeTruthy();
    expect(minHpPlayer.hp).toBe(10);
    expect(otherPlayer.hp).toBe(20);
    expect(minHpPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('При беспределе выбирает среди всех игроков', async () => {
    activePlayer.hp = 10;
    spyOn(activePlayer, 'guard').mockImplementation(fn()).mockResolvedValue(true);

    await creature6.play({ type: 'byLawlessness' });

    expect(creature6.played).toBeFalsy();
    expect(minHpPlayer.hp).toBe(14);
    expect(activePlayer.hp).toBe(6);
    expect(otherPlayer.hp).toBe(20);
    expect(activePlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(0);
  });
});
