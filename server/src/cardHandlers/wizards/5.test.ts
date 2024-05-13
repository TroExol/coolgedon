import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('wizards 5', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let wizard5: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    wizard5 = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][5]);
    testHelper.giveCardToPlayer(wizard5, activePlayer);
  });

  test('Разыгрывается', async () => {
    const topCard = getLastElement(otherPlayer.hand)!;

    spyOn(otherPlayer, 'selectCards').mockResolvedValue({ cards: [topCard] });
    const guardSpy = spyOn(otherPlayer, 'guard');

    await wizard5.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard5.played).toBeTruthy();
    expect(otherPlayer.hand.length).toBe(4);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(guardSpy.mock.results[0]).toBeTruthy();
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Защитился', async () => {
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await wizard5.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard5.played).toBeTruthy();
    expect(otherPlayer.hand.length).toBe(5);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не защищается, если нельзя', async () => {
    const topCard = getLastElement(otherPlayer.hand)!;

    spyOn(otherPlayer, 'selectCards').mockResolvedValue({ cards: [topCard] });
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await wizard5.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(wizard5.played).toBeTruthy();
    expect(otherPlayer.hand.length).toBe(4);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(2);
  });
});
