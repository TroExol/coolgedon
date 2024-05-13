import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('lawlessnesses 9', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let otherPlayer2: Player;
  let lawlessness9: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 }); // Левый враг
    otherPlayer2 = testHelper.createMockPlayer({ room, nickname: 'otherPlayer2', prop: prop4 }); // Правый враг
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    testHelper.addPlayerToRoom(room, otherPlayer2);
    lawlessness9 = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][9]);
  });

  test('Разыгрывается', async () => {
    await lawlessness9.play({ type: 'lawlessness' });

    expect(lawlessness9.played).toBeFalsy();
    expect(otherPlayer.hand.length).toBe(7);
    expect(otherPlayer.deck.length).toBe(3);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Защитился', async () => {
    spyOn(otherPlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await lawlessness9.play({ type: 'lawlessness' });

    expect(lawlessness9.played).toBeFalsy();
    expect(otherPlayer.hand.length).toBe(5);
    expect(otherPlayer.deck.length).toBe(5);
    expect(activePlayer.totalPower).toBe(0);
  });
});
