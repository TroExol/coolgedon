import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('lawlessnesses 4', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let lawlessness4: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    lawlessness4 = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][4]);
  });

  test('Разыгрывается', async () => {
    spyOn(activePlayer, 'guard');
    spyOn(otherPlayer, 'guard');

    await lawlessness4.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness4.played).toBeFalsy();
    expect(activePlayer.hand.length).toBe(5);
    expect(activePlayer.hand.some(card => card.theSameType(ECardTypes.crazyMagic))).toBeTruthy();
    expect(activePlayer.hand.find(card => card.theSameType(ECardTypes.crazyMagic))?.ownerNickname)
      .toBe(activePlayer.nickname);
    expect(otherPlayer.hand.length).toBe(5);
    expect(otherPlayer.hand.some(card => card.theSameType(ECardTypes.crazyMagic))).toBeTruthy();
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Защитился', async () => {
    spyOn(activePlayer, 'guard');
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await lawlessness4.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness4.played).toBeFalsy();
    expect(activePlayer.hand.length).toBe(5);
    expect(activePlayer.hand.some(card => card.theSameType(ECardTypes.crazyMagic))).toBeTruthy();
    expect(otherPlayer.hand.length).toBe(5);
    expect(otherPlayer.hand.some(card => card.theSameType(ECardTypes.crazyMagic))).toBeFalsy();
    expect(activePlayer.guard).toHaveBeenCalledTimes(1);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Не удаляет карты, если их нет', async () => {
    activePlayer.hand = [];

    spyOn(activePlayer, 'removeCards');
    spyOn(activePlayer, 'guard');
    spyOn(otherPlayer, 'guard');

    await lawlessness4.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness4.played).toBeFalsy();
    expect(activePlayer.hand.length).toBe(1);
    expect(activePlayer.hand.some(card => card.theSameType(ECardTypes.crazyMagic))).toBeTruthy();
    expect(otherPlayer.hand.length).toBe(5);
    expect(otherPlayer.hand.some(card => card.theSameType(ECardTypes.crazyMagic))).toBeTruthy();
    expect(activePlayer.removeCards).toHaveBeenCalledTimes(0);
    expect(activePlayer.guard).toHaveBeenCalledTimes(1);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Не добавляет шальную магию, если ее нет', async () => {
    room.crazyMagic = [];

    spyOn(activePlayer, 'guard');
    spyOn(otherPlayer, 'guard');

    await lawlessness4.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness4.played).toBeFalsy();
    expect(activePlayer.hand.length).toBe(4);
    expect(activePlayer.hand.some(card => card.theSameType(ECardTypes.crazyMagic))).toBeFalsy();
    expect(otherPlayer.hand.length).toBe(4);
    expect(otherPlayer.hand.some(card => card.theSameType(ECardTypes.crazyMagic))).toBeFalsy();
    expect(activePlayer.guard).toHaveBeenCalledTimes(1);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(0);
  });
});
