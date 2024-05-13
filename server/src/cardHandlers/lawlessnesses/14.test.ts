import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('lawlessnesses 14', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let lawlessness14: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    lawlessness14 = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][14]);
  });

  test('Разыгрывается', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.places][1]);
    activePlayer.activePermanent = [card];

    spyOn(activePlayer, 'selectCards');
    spyOn(activePlayer, 'guard').mockImplementation(fn()).mockResolvedValue(true);
    spyOn(otherPlayer, 'guard');

    await lawlessness14.play({ type: 'lawlessness' });

    expect(lawlessness14.played).toBeFalsy();
    expect(activePlayer.activePermanent.length).toBe(0);
    expect(activePlayer.discard).toEqual([card]);
    expect(otherPlayer.guard).toHaveBeenCalledTimes(0);
    expect(activePlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.selectCards).toHaveBeenCalledTimes(0);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Разыгрывается и дает выбор', async () => {
    const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.places][1]);
    const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.places][2]);
    activePlayer.activePermanent = [card1, card2];

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [card1] });
    spyOn(activePlayer, 'guard');

    await lawlessness14.play({ type: 'lawlessness' });

    expect(lawlessness14.played).toBeFalsy();
    expect(activePlayer.activePermanent).toEqual([card2]);
    expect(activePlayer.discard).toEqual([card1]);
    expect(activePlayer.guard).toHaveBeenCalledTimes(1);
    expect(activePlayer.selectCards).toHaveBeenCalledTimes(1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Защитился', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.places][1]);
    activePlayer.activePermanent = [card];

    spyOn(activePlayer, 'guard').mockImplementation(fn()).mockResolvedValue(false);

    await lawlessness14.play({ type: 'lawlessness' });

    expect(lawlessness14.played).toBeFalsy();
    expect(activePlayer.activePermanent).toEqual([card]);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.totalPower).toBe(0);
  });
});
