import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Player } from 'Entity/player';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';
import * as playTowerEvent from 'Event/playTower';
import { endTurn } from 'Event/endTurn';
import { type Room, getEmptyOnCurrentTurn } from 'Entity/room';

import spyOn = jest.spyOn;

describe('endTurn', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let playTowerSpy: jest.SpyInstance;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);

    spyOn(room, 'logEvent');
    spyOn(room, 'sendInfo');
    playTowerSpy = spyOn(playTowerEvent, 'playTower').mockImplementation(async () => {});
  });

  afterEach(() => {
    playTowerSpy.mockRestore();
  });

  test('Заканчивается ход', async () => {
    const hand = [...activePlayer.hand];

    await endTurn(room);

    expect(room.activePlayer).toEqual(otherPlayer);
    hand.forEach(card => {
      expect(activePlayer.hand.indexOf(card)).toBe(-1);
    });
    expect(activePlayer.discard.length).toBe(5);
    expect(room.sendInfo).toHaveBeenCalledTimes(1);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer закончил ход');
    expect(playTowerSpy).toHaveBeenCalledTimes(0);
    expect(room.onCurrentTurn).toEqual(getEmptyOnCurrentTurn());
  });

  test('Заканчивается ход и разыгрывается башня', async () => {
    const hand = [...activePlayer.hand];
    activePlayer.hasTower = true;

    await endTurn(room);

    expect(room.activePlayer).toEqual(otherPlayer);
    hand.forEach(card => {
      expect(activePlayer.hand.indexOf(card)).toBe(-1);
    });
    expect(activePlayer.discard.length).toBe(5);
    expect(room.sendInfo).toHaveBeenCalledTimes(1);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer закончил ход');
    expect(playTowerSpy).toHaveBeenCalledTimes(1);
    expect(room.onCurrentTurn).toEqual(getEmptyOnCurrentTurn());
  });

  test('Заканчивается ход и возвращаются заимствованные карты', async () => {
    const cardTemp = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    cardTemp.ownerNickname = otherPlayer.nickname;
    cardTemp.tempOwnerNickname = activePlayer.nickname;
    activePlayer.hand.push(cardTemp);
    const hand = [...activePlayer.hand];

    await endTurn(room);

    expect(room.activePlayer).toEqual(otherPlayer);
    hand.forEach(card => {
      expect(activePlayer.hand.indexOf(card)).toBe(-1);
    });
    expect(otherPlayer.discard.indexOf(cardTemp)).not.toBe(-1);
    expect(activePlayer.discard.length).toBe(5);
    expect(room.sendInfo).toHaveBeenCalledTimes(1);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer закончил ход');
    expect(playTowerSpy).toHaveBeenCalledTimes(0);
    expect(room.onCurrentTurn).toEqual(getEmptyOnCurrentTurn());
  });

  test('Заканчивается ход и сбрасываются флаги карт', async () => {
    const topCard = getLastElement(activePlayer.hand)!;
    topCard.playing = true;
    topCard.played = true;
    const hand = [...activePlayer.hand];

    await endTurn(room);

    expect(room.activePlayer).toEqual(otherPlayer);
    hand.forEach(card => {
      expect(activePlayer.hand.indexOf(card)).toBe(-1);
    });
    expect(topCard.played).toBeFalsy();
    expect(topCard.playing).toBeFalsy();
    expect(activePlayer.discard.length).toBe(5);
    expect(room.sendInfo).toHaveBeenCalledTimes(1);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer закончил ход');
    expect(playTowerSpy).toHaveBeenCalledTimes(0);
    expect(room.onCurrentTurn).toEqual(getEmptyOnCurrentTurn());
  });

  test('Заканчивается ход и сбрасываются флаги свойств', async () => {
    const topProp = getLastElement(activePlayer.props)!;
    topProp.played = true;
    const hand = [...activePlayer.hand];

    await endTurn(room);

    expect(room.activePlayer).toEqual(otherPlayer);
    hand.forEach(card => {
      expect(activePlayer.hand.indexOf(card)).toBe(-1);
    });
    expect(topProp.played).toBeFalsy();
    expect(activePlayer.discard.length).toBe(5);
    expect(room.sendInfo).toHaveBeenCalledTimes(1);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer закончил ход');
    expect(playTowerSpy).toHaveBeenCalledTimes(0);
    expect(room.onCurrentTurn).toEqual(getEmptyOnCurrentTurn());
  });

  test('Разыгрывается prop 3', async () => {
    const prop3 = testHelper.createMockProp(propMap[3]);
    spyOn(prop3, 'play').mockImplementation(async () => {});
    activePlayer.props = [prop3];
    room.onCurrentTurn.boughtOrReceivedCards[ECardTypes.wizards] = [
      testHelper.createMockCard(room, cardMap[ECardTypes.wizards][1]),
    ];
    const hand = [...activePlayer.hand];

    await endTurn(room);

    expect(room.activePlayer).toEqual(otherPlayer);
    hand.forEach(card => {
      expect(activePlayer.hand.indexOf(card)).toBe(-1);
    });
    expect(activePlayer.discard.length).toBe(5);
    expect(room.sendInfo).toHaveBeenCalledTimes(1);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer закончил ход');
    expect(playTowerSpy).toHaveBeenCalledTimes(0);
    expect(prop3.play).toHaveBeenCalledTimes(1);
    expect(room.onCurrentTurn).toEqual(getEmptyOnCurrentTurn());
  });

  test('Не заканчивается ход без активного игрока', async () => {
    room.players = {};
    const hand = [...activePlayer.hand];

    await endTurn(room);

    expect(room.activePlayer).toBeUndefined();
    hand.forEach(card => {
      expect(activePlayer.hand.indexOf(card)).not.toBe(-1);
    });
    expect(activePlayer.discard.length).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
    expect(playTowerSpy).toHaveBeenCalledTimes(0);
    expect(room.onCurrentTurn).toEqual(getEmptyOnCurrentTurn());
  });

  test('Не заканчивается ход, если игроков < 2', async () => {
    delete room.players.otherPlayer;
    const hand = [...activePlayer.hand];

    await endTurn(room);

    expect(room.activePlayer).toEqual(activePlayer);
    hand.forEach(card => {
      expect(activePlayer.hand.indexOf(card)).not.toBe(-1);
    });
    expect(activePlayer.discard.length).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
    expect(playTowerSpy).toHaveBeenCalledTimes(0);
    expect(room.onCurrentTurn).toEqual(getEmptyOnCurrentTurn());
  });

  test('Не заканчивается ход, если игра закончилась', async () => {
    room.gameEnded = true;
    const hand = [...activePlayer.hand];

    await endTurn(room);

    expect(room.activePlayer).toEqual(activePlayer);
    hand.forEach(card => {
      expect(activePlayer.hand.indexOf(card)).not.toBe(-1);
    });
    expect(activePlayer.discard.length).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
    expect(playTowerSpy).toHaveBeenCalledTimes(0);
    expect(room.onCurrentTurn).toEqual(getEmptyOnCurrentTurn());
  });

  test('При удалении игрока не происходят манипуляции с этим игроком', async () => {
    activePlayer.hasTower = true;

    const topCard = getLastElement(activePlayer.hand)!;
    topCard.playing = true;
    topCard.played = true;
    const topProp = getLastElement(activePlayer.props)!;
    topProp.played = true;

    const prop3 = testHelper.createMockProp(propMap[3]);
    spyOn(prop3, 'play').mockImplementation(async () => {});
    activePlayer.props.push(prop3);
    room.onCurrentTurn.boughtOrReceivedCards[ECardTypes.wizards] = [
      testHelper.createMockCard(room, cardMap[ECardTypes.wizards][1]),
    ];

    const hand = [...activePlayer.hand];

    await endTurn(room, true);

    expect(room.activePlayer).toEqual(otherPlayer);
    hand.forEach(card => {
      expect(activePlayer.hand.indexOf(card)).not.toBe(-1);
    });
    expect(activePlayer.discard.length).toBe(0);
    expect(topProp.played).toBeTruthy();
    expect(topCard.played).toBeTruthy();
    expect(topCard.playing).toBeTruthy();
    expect(room.sendInfo).toHaveBeenCalledTimes(1);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer закончил ход');
    expect(playTowerSpy).toHaveBeenCalledTimes(0);
    expect(prop3.play).toHaveBeenCalledTimes(0);
    expect(room.onCurrentTurn).toEqual(getEmptyOnCurrentTurn());
  });
});
