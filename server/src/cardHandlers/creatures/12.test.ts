import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('creature 12', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let creature12: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    creature12 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][12]);
    testHelper.giveCardToPlayer(creature12, activePlayer);
  });

  test('Разыгрывается', async () => {
    activePlayer.activePermanent = [
      testHelper.createMockCard(room, cardMap[ECardTypes.places][1]),
      testHelper.createMockCard(room, cardMap[ECardTypes.places][2]),
    ];

    spyOn(otherPlayer, 'guard');

    await creature12.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature12.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(14);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Разыгрывается с 0 урона', async () => {
    spyOn(otherPlayer, 'guard');

    await creature12.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature12.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Защитился', async () => {
    activePlayer.activePermanent = [
      testHelper.createMockCard(room, cardMap[ECardTypes.places][1]),
      testHelper.createMockCard(room, cardMap[ECardTypes.places][2]),
    ];

    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await creature12.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature12.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не защищается, если нельзя', async () => {
    activePlayer.activePermanent = [
      testHelper.createMockCard(room, cardMap[ECardTypes.places][1]),
      testHelper.createMockCard(room, cardMap[ECardTypes.places][2]),
    ];

    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await creature12.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(creature12.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(14);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(2);
  });
});
