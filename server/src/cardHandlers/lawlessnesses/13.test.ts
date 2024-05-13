import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('lawlessnesses 13', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let lawlessness13: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    lawlessness13 = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][13]);
  });

  test('Разыгрывается', async () => {
    activePlayer.hp = 10;
    spyOn(activePlayer, 'guard');
    spyOn(otherPlayer, 'guard');

    await lawlessness13.play({ type: 'lawlessness' });

    expect(lawlessness13.played).toBeFalsy();
    expect(activePlayer.hp).toBe(7);
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Защитился', async () => {
    activePlayer.hp = 11;
    otherPlayer.hp = 9;
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await lawlessness13.play({ type: 'lawlessness' });

    expect(lawlessness13.played).toBeFalsy();
    expect(activePlayer.hp).toBe(11);
    expect(otherPlayer.hp).toBe(9);
    expect(activePlayer.totalPower).toBe(0);
  });
});
