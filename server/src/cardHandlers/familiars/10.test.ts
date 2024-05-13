import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('familiars 10', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let otherPlayer2: Player;
  let familiar10: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    otherPlayer2 = testHelper.createMockPlayer({ room, nickname: 'minHpPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    testHelper.addPlayerToRoom(room, otherPlayer2);
    familiar10 = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][10]);
    testHelper.giveCardToPlayer(familiar10, activePlayer);
  });

  test('Разыгрывается', async () => {
    const creature = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    activePlayer.discard = [creature, creature];
    activePlayer.hand.push(creature);

    spyOn(otherPlayer, 'guard');
    spyOn(otherPlayer2, 'guard');

    await familiar10.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(familiar10.played).toBeTruthy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(14);
    expect(otherPlayer2.hp).toBe(14);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(otherPlayer2.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Разыгрывается с 0 урона', async () => {
    spyOn(otherPlayer, 'guard');
    spyOn(otherPlayer2, 'guard');

    await familiar10.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(familiar10.played).toBeTruthy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer2.hp).toBe(20);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(otherPlayer2.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не защищается, если нельзя', async () => {
    const creature = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    activePlayer.discard = [creature, creature];
    activePlayer.hand.push(creature);

    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);
    spyOn(otherPlayer2, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await familiar10.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(familiar10.played).toBeTruthy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(14);
    expect(otherPlayer2.hp).toBe(14);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(otherPlayer2.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Атакует только target', async () => {
    const creature = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    activePlayer.discard = [creature, creature];
    activePlayer.hand.push(creature);

    spyOn(activePlayer, 'guard');
    spyOn(otherPlayer, 'guard');
    spyOn(otherPlayer2, 'guard');

    await familiar10.play({ type: 'simple', params: { target: otherPlayer2 } });

    expect(familiar10.played).toBeFalsy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer2.hp).toBe(14);
    expect(activePlayer.guard).toHaveBeenCalledTimes(0);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(otherPlayer2.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(0);
  });
});
