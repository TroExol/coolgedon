import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('lawlessnesses 26', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let lawlessness26: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    lawlessness26 = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][26]);
  });

  test('Разыгрывается', async () => {
    const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]); // cost 4
    const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]); // cost 4
    room.deck.push(card1);
    room.deck.push(card2);

    spyOn(activePlayer, 'guard');
    spyOn(otherPlayer, 'guard');

    await lawlessness26.play({ type: 'lawlessness' });

    expect(lawlessness26.played).toBeFalsy();
    expect(activePlayer.hp).toBe(16);
    expect(otherPlayer.hp).toBe(16);
    expect(activePlayer.discard).toEqual([card2]);
    expect(card2.ownerNickname).toBe(activePlayer.nickname);
    expect(otherPlayer.discard).toEqual([card1]);
    expect(card1.ownerNickname).toBe(otherPlayer.nickname);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Защитился', async () => {
    const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]); // cost 4
    const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]); // cost 4
    room.deck.push(card1);
    room.deck.push(card2);

    spyOn(activePlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await lawlessness26.play({ type: 'lawlessness' });

    expect(lawlessness26.played).toBeFalsy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(16);
    expect(activePlayer.discard.length).toBe(0);
    expect(otherPlayer.discard).toEqual([card2]);
    expect(card2.ownerNickname).toBe(otherPlayer.nickname);
    expect(activePlayer.totalPower).toBe(0);
  });
});
