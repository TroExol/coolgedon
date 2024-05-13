import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import { toPlayerVariant } from 'Helpers';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('spells 8', () => {
  let room: Room;
  let activePlayer: Player;
  let leftPlayer: Player;
  let otherPlayer: Player;
  let rightPlayer: Player;
  let spell8: Card;

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
    spell8 = testHelper.createMockCard(room, cardMap[ECardTypes.spells][8]);
    testHelper.giveCardToPlayer(spell8, activePlayer);
  });

  test('Разыгрывается', async () => {
    const selectVariantSpy = spyOn(activePlayer, 'selectVariant').mockImplementation(fn()).mockResolvedValue(leftPlayer.nickname);
    const guardSpy = spyOn(leftPlayer, 'guard');

    await spell8.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(spell8.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(7);
    expect(leftPlayer.hp).toBe(14);
    expect(leftPlayer.guard).toHaveBeenCalledTimes(1);
    expect(selectVariantSpy.mock.calls[0][0].variants)
      .toEqual([toPlayerVariant(leftPlayer), toPlayerVariant(rightPlayer)]);
    expect(guardSpy.mock.results[0]).toBeTruthy();
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Защитился', async () => {
    spyOn(activePlayer, 'selectVariant').mockImplementation(fn()).mockResolvedValue(leftPlayer.nickname);
    spyOn(leftPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await spell8.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(spell8.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(7);
    expect(leftPlayer.hp).toBe(20);
    expect(leftPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Не защищается, если нельзя', async () => {
    spyOn(activePlayer, 'selectVariant').mockImplementation(fn()).mockResolvedValue(leftPlayer.nickname);
    spyOn(leftPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await spell8.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(spell8.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(7);
    expect(leftPlayer.hp).toBe(14);
    expect(leftPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Не разыгрывается, если не выбрана цель', async () => {
    spyOn(activePlayer, 'selectVariant').mockImplementation(fn()).mockResolvedValue(undefined);
    spyOn(leftPlayer, 'guard');

    await spell8.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(spell8.played).toBeFalsy();
    expect(activePlayer.hand.length).toBe(6);
    expect(leftPlayer.hp).toBe(20);
    expect(leftPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(0);
  });
});
