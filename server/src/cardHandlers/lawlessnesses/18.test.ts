import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('lawlessnesses 18', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let lawlessness18: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    lawlessness18 = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][18]);
  });

  test('Разыгрывается', async () => {
    spyOn(activePlayer, 'guard');
    spyOn(otherPlayer, 'guard');

    await lawlessness18.play({ type: 'lawlessness' });

    expect(lawlessness18.played).toBeFalsy();
    expect(activePlayer.deck.length).toBe(6);
    expect(otherPlayer.deck.length).toBe(6);
    expect(getLastElement(activePlayer.deck)?.type).toBe(ECardTypes.sluggishStick);
    expect(getLastElement(otherPlayer.deck)?.type).toBe(ECardTypes.sluggishStick);
    expect(getLastElement(activePlayer.deck)?.ownerNickname).toBe(activePlayer.nickname);
    expect(getLastElement(otherPlayer.deck)?.ownerNickname).toBe(otherPlayer.nickname);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Защитился', async () => {
    spyOn(activePlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await lawlessness18.play({ type: 'lawlessness' });

    expect(lawlessness18.played).toBeFalsy();
    expect(activePlayer.deck.length).toBe(5);
    expect(otherPlayer.deck.length).toBe(6);
    expect(getLastElement(otherPlayer.deck)?.type).toBe(ECardTypes.sluggishStick);
    expect(getLastElement(otherPlayer.deck)?.ownerNickname).toBe(otherPlayer.nickname);
    expect(activePlayer.totalPower).toBe(0);
  });
});
