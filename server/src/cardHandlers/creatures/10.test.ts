import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Prop } from 'Entity/prop';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('creature 10', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let otherPlayer2: Player;
  let creature6: Card;
  let prop4: Prop;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    otherPlayer2 = testHelper.createMockPlayer({ room, nickname: 'minHpPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    testHelper.addPlayerToRoom(room, otherPlayer2);
    creature6 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][10]);
    testHelper.giveCardToPlayer(creature6, activePlayer);
  });

  test('Разыгрывается', async () => {
    spyOn(otherPlayer, 'guard');
    spyOn(otherPlayer2, 'guard');

    await creature6.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature6.played).toBeTruthy();
    expect(otherPlayer.discard.map(({ type }) => type)).toEqual([ECardTypes.sluggishStick]);
    expect(otherPlayer.discard[0].ownerNickname).toBe(otherPlayer.nickname);
    expect(otherPlayer2.discard.map(({ type }) => type)).toEqual([ECardTypes.sluggishStick]);
    expect(otherPlayer2.discard[0].ownerNickname).toBe(otherPlayer2.nickname);
    expect(activePlayer.discard.length).toBe(0);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(otherPlayer2.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Накручиваются жизни за каждого избежавшего атаки', async () => {
    activePlayer.hp = 10;

    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);
    spyOn(otherPlayer2, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await creature6.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature6.played).toBeTruthy();
    expect(activePlayer.hp).toBe(18);
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer2.hp).toBe(20);
    expect(activePlayer.discard.length).toBe(0);
    expect(otherPlayer.discard.length).toBe(0);
    expect(otherPlayer2.discard.length).toBe(0);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(otherPlayer2.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Накручиваются жизни за избежавшего атаки', async () => {
    activePlayer.hp = 10;

    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(true);
    spyOn(otherPlayer2, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await creature6.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature6.played).toBeTruthy();
    expect(activePlayer.hp).toBe(14);
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer2.hp).toBe(20);
    expect(activePlayer.discard.length).toBe(0);
    expect(otherPlayer.discard.map(({ type }) => type)).toEqual([ECardTypes.sluggishStick]);
    expect(otherPlayer2.discard.length).toBe(0);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(otherPlayer2.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не защищается, если нельзя', async () => {
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);
    spyOn(otherPlayer2, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await creature6.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(creature6.played).toBeTruthy();
    expect(otherPlayer.discard.map(({ type }) => type)).toEqual([ECardTypes.sluggishStick]);
    expect(otherPlayer2.discard.map(({ type }) => type)).toEqual([ECardTypes.sluggishStick]);
    expect(activePlayer.discard.length).toBe(0);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(otherPlayer2.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('При беспределе атакует всех игроков', async () => {
    spyOn(activePlayer, 'guard').mockImplementation(fn()).mockResolvedValue(true);
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);
    spyOn(otherPlayer2, 'guard').mockImplementation(fn()).mockResolvedValue(true);

    await creature6.play({ type: 'byLawlessness' });

    expect(creature6.played).toBeFalsy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer2.hp).toBe(20);
    expect(otherPlayer.discard.length).toBe(0);
    expect(activePlayer.discard.map(({ type }) => type)).toEqual([ECardTypes.sluggishStick]);
    expect(otherPlayer2.discard.map(({ type }) => type)).toEqual([ECardTypes.sluggishStick]);
    expect(activePlayer.guard).toHaveBeenCalledTimes(1);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(otherPlayer2.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Атакует только target', async () => {
    spyOn(activePlayer, 'guard');
    spyOn(otherPlayer, 'guard');
    spyOn(otherPlayer2, 'guard');

    await creature6.play({ type: 'simple', params: { target: otherPlayer2 } });

    expect(creature6.played).toBeFalsy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer2.hp).toBe(20);
    expect(otherPlayer.discard.length).toBe(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(otherPlayer2.discard.map(({ type }) => type)).toEqual([ECardTypes.sluggishStick]);
    expect(activePlayer.guard).toHaveBeenCalledTimes(0);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(otherPlayer2.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(0);
  });
});
