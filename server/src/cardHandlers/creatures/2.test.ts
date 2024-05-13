import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('creature 2', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let creature2: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    creature2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
    testHelper.giveCardToPlayer(creature2, activePlayer);
  });

  test('Разыгрывается', async () => {
    activePlayer.discard.push(...room.sluggishStick.splice(-2));
    activePlayer.hand.push(...room.sluggishStick.splice(-2));

    const guardSpy = spyOn(otherPlayer, 'guard');

    await creature2.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature2.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(12);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(guardSpy.mock.results[0]).toBeTruthy();
    expect(activePlayer.hand.length).toBe(8);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Разыгрывается с 0 урона', async () => {
    spyOn(otherPlayer, 'guard');

    await creature2.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature2.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.hand.length).toBe(7);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Защитился', async () => {
    activePlayer.discard.push(...room.sluggishStick.splice(-2));
    activePlayer.hand.push(...room.sluggishStick.splice(-2));

    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await creature2.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature2.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.hand.length).toBe(9);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не защищается, если нельзя', async () => {
    activePlayer.discard.push(...room.sluggishStick.splice(-2));
    activePlayer.hand.push(...room.sluggishStick.splice(-2));

    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await creature2.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(creature2.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(12);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.hand.length).toBe(8);
    expect(activePlayer.totalPower).toBe(2);
  });
});
