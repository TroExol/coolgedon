import { cardMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import { buyFamiliarCard } from 'Event/buyFamiliarCard';

import spyOn = jest.spyOn;

describe('buyFamiliarCard', () => {
  let room: Room;
  let activePlayer: Player;
  let familiar: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    familiar = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][1]); // cost 6
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', familiarToBuy: familiar });
    testHelper.addPlayerToRoom(room, activePlayer);

    spyOn(room, 'logEvent');
    spyOn(room, 'sendInfo');
  });

  test('Приобретается фамильяр', () => {
    room.onCurrentTurn.additionalPower = 6;
    buyFamiliarCard(room);
    expect(room.onCurrentTurn.additionalPower).toBe(6);
    expect(activePlayer.familiarToBuy).toBeNull();
    expect(room.onCurrentTurn.powerWasted).toBe(6);
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard.slice(-1)[0]).toEqual(familiar);
    expect(room.sendInfo).toHaveBeenCalledTimes(1);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer купил фамильяра');
  });

  test('Нельзя купить, если не хватает силы', () => {
    room.onCurrentTurn.additionalPower = 2;
    buyFamiliarCard(room);
    expect(room.onCurrentTurn.additionalPower).toBe(2);
    expect(activePlayer.familiarToBuy).toEqual(familiar);
    expect(room.onCurrentTurn.powerWasted).toBe(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
  });

  test('Нельзя купить, если нет активного игрока', () => {
    room.onCurrentTurn.additionalPower = 6;
    room.players = {};
    buyFamiliarCard(room);
    expect(room.onCurrentTurn.additionalPower).toBe(6);
    expect(activePlayer.familiarToBuy).toEqual(familiar);
    expect(room.onCurrentTurn.powerWasted).toBe(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
  });

  test('Нельзя купить, если игра закончилась', () => {
    room.onCurrentTurn.additionalPower = 6;
    room.gameEnded = true;
    buyFamiliarCard(room);
    expect(room.onCurrentTurn.additionalPower).toBe(6);
    expect(activePlayer.familiarToBuy).toEqual(familiar);
    expect(room.onCurrentTurn.powerWasted).toBe(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
  });

  test('Нельзя купить, если карт нет', () => {
    room.onCurrentTurn.additionalPower = 6;
    activePlayer.familiarToBuy = null;
    buyFamiliarCard(room);
    expect(room.onCurrentTurn.additionalPower).toBe(6);
    expect(activePlayer.familiarToBuy).toBeNull();
    expect(room.onCurrentTurn.powerWasted).toBe(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
  });
});
