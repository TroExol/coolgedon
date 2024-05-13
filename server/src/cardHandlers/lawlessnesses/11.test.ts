import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('lawlessnesses 11', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let otherPlayer2: Player;
  let lawlessness11: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    otherPlayer2 = testHelper.createMockPlayer({ room, nickname: 'otherPlayer2', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    testHelper.addPlayerToRoom(room, otherPlayer2);
    lawlessness11 = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][11]);
  });

  test('Разыгрывается', async () => {
    activePlayer.hp = 10;

    await lawlessness11.play({ type: 'lawlessness' });

    expect(lawlessness11.played).toBeFalsy();
    expect(activePlayer.hp).toBe(10);
    expect(otherPlayer.hp).toBe(14);
    expect(otherPlayer2.hp).toBe(14);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Защитился', async () => {
    activePlayer.hp = 10;
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await lawlessness11.play({ type: 'lawlessness' });

    expect(lawlessness11.played).toBeFalsy();
    expect(activePlayer.hp).toBe(10);
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer2.hp).toBe(14);
    expect(activePlayer.totalPower).toBe(0);
  });
});
