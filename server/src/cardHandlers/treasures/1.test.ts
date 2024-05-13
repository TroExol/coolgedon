import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('treasures 1', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let otherPlayer2: Player;
  let treasures1: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'leftPlayer', prop: prop4 });
    otherPlayer2 = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    testHelper.addPlayerToRoom(room, otherPlayer2);
    treasures1 = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][1]);
    testHelper.giveCardToPlayer(treasures1, activePlayer);
  });

  test('Разыгрывается', async () => {
    otherPlayer.discard = [
      testHelper.createMockCard(room, cardMap[ECardTypes.legends][1]),
      testHelper.createMockCard(room, cardMap[ECardTypes.legends][1]),
    ];

    const guardSpy = spyOn(otherPlayer, 'guard');

    await treasures1.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(treasures1.played).toBeTruthy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(12);
    expect(otherPlayer2.hp).toBe(20);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(guardSpy.mock.results[0]).toBeTruthy();
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Защитился', async () => {
    otherPlayer.discard = [
      testHelper.createMockCard(room, cardMap[ECardTypes.legends][1]),
      testHelper.createMockCard(room, cardMap[ECardTypes.legends][1]),
    ];
    const handCard = activePlayer.hand[0];

    const selectCardsSpy = spyOn(activePlayer, 'selectCards').mockResolvedValue({ cards: [handCard] });
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await treasures1.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(treasures1.played).toBeTruthy();
    expect(selectCardsSpy.mock.calls[0][0].cards.includes(treasures1)).toBeFalsy();
    expect(activePlayer.hand.length).toBe(5);
    expect(activePlayer.hand.includes(handCard)).toBeFalsy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer2.hp).toBe(20);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не защищается, если нельзя', async () => {
    otherPlayer.discard = [
      testHelper.createMockCard(room, cardMap[ECardTypes.legends][1]),
    ];

    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await treasures1.play({ type: 'simple', params: { cardUsedByPlayer: true, canGuard: false } });

    expect(treasures1.played).toBeTruthy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(16);
    expect(otherPlayer2.hp).toBe(20);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Разыгрывается без легенд', async () => {
    spyOn(activePlayer, 'selectCards').mockResolvedValue({ cards: [] });

    await treasures1.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(treasures1.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer2.hp).toBe(20);
    expect(activePlayer.totalPower).toBe(2);
  });
});
