import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('lawlessnesses 25', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let lawlessness25: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    lawlessness25 = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][25]);
  });

  test('Разыгрывается', async () => {
    const seed1 = testHelper.createMockCard(room, cardMap[ECardTypes.seeds][1]);
    const seed2 = testHelper.createMockCard(room, cardMap[ECardTypes.seeds][1]);
    const seed3 = testHelper.createMockCard(room, cardMap[ECardTypes.seeds][2]);
    activePlayer.discard = [seed1, seed2, seed3];
    otherPlayer.discard = [seed3];

    spyOn(activePlayer, 'guard');
    spyOn(otherPlayer, 'guard');

    await lawlessness25.play({ type: 'lawlessness' });

    expect(lawlessness25.played).toBeFalsy();
    expect(activePlayer.discard).toEqual([seed3]);
    expect(otherPlayer.discard).toEqual([seed3]);
    expect(activePlayer.deck.slice(-2)).toEqual([seed2, seed1]);
    expect(activePlayer.deck.length).toBe(7);
    expect(otherPlayer.deck.length).toBe(5);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Защитился', async () => {
    const seed1 = testHelper.createMockCard(room, cardMap[ECardTypes.seeds][1]);
    const seed2 = testHelper.createMockCard(room, cardMap[ECardTypes.seeds][1]);
    const seed3 = testHelper.createMockCard(room, cardMap[ECardTypes.seeds][2]);
    activePlayer.discard = [seed1, seed2, seed3];

    spyOn(activePlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await lawlessness25.play({ type: 'lawlessness' });

    expect(lawlessness25.played).toBeFalsy();
    expect(activePlayer.discard).toEqual([seed1, seed2, seed3]);
    expect(activePlayer.deck.length).toBe(5);
    expect(activePlayer.totalPower).toBe(0);
  });
});
