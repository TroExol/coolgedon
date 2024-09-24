import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Player } from 'Entity/player';

import * as testHelper from 'Helpers/tests';
import { createMockCard } from 'Helpers/tests';
import { getLastElement } from 'Helpers';
import { endTurn, playTower } from 'Event/endTurn';
import * as endTurnEvent from 'Event/endTurn';
import { type Room, getEmptyOnCurrentTurn } from 'Entity/room';

import spyOn = jest.spyOn;
import fn = jest.fn;

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
    playTowerSpy = spyOn(endTurnEvent, 'playTower').mockImplementation(async () => {});
  });

  afterEach(() => {
    playTowerSpy.mockRestore();
  });

  test('Заканчивается ход', async () => {
    const hand = [...activePlayer.hand];

    await endTurn(room, activePlayer.nickname);

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

    await endTurn(room, activePlayer.nickname);

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

  test('Заканчивается ход и сбрасываются флаги карт', async () => {
    const topCard = getLastElement(activePlayer.hand)!;
    topCard.playing = true;
    topCard.played = true;
    const topCard2 = getLastElement(otherPlayer.hand)!;
    topCard2.playing = true;
    topCard2.played = true;
    const hand = [...activePlayer.hand];

    await endTurn(room, activePlayer.nickname);

    expect(room.activePlayer).toEqual(otherPlayer);
    hand.forEach(card => {
      expect(activePlayer.hand.indexOf(card)).toBe(-1);
    });
    expect(topCard.played).toBeFalsy();
    expect(topCard.playing).toBeFalsy();
    expect(topCard2.played).toBeFalsy();
    expect(topCard2.playing).toBeFalsy();
    expect(activePlayer.discard.length).toBe(5);
    expect(room.sendInfo).toHaveBeenCalledTimes(1);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer закончил ход');
    expect(playTowerSpy).toHaveBeenCalledTimes(0);
    expect(room.onCurrentTurn).toEqual(getEmptyOnCurrentTurn());
  });

  test('Заканчивается ход и сбрасываются флаги свойств', async () => {
    const prop3 = testHelper.createMockProp({ room, ...propMap[3] });
    prop3.ownerNickname = activePlayer.nickname;
    spyOn(prop3, 'play');
    const hand = [...activePlayer.hand];

    await endTurn(room, activePlayer.nickname);

    expect(room.activePlayer).toEqual(otherPlayer);
    hand.forEach(card => {
      expect(activePlayer.hand.indexOf(card)).toBe(-1);
    });
    expect(prop3.played).toBeFalsy();
    expect(prop3.play).toHaveBeenCalledTimes(0);
    expect(activePlayer.discard.length).toBe(5);
    expect(room.sendInfo).toHaveBeenCalledTimes(1);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer закончил ход');
    expect(playTowerSpy).toHaveBeenCalledTimes(0);
    expect(room.onCurrentTurn).toEqual(getEmptyOnCurrentTurn());
  });

  test('Разыгрывается prop 3', async () => {
    const prop3 = testHelper.createMockProp({ room, ...propMap[3] });
    prop3.ownerNickname = activePlayer.nickname;
    spyOn(prop3, 'play');
    activePlayer.props = [prop3];
    room.onCurrentTurn.boughtOrReceivedCards[ECardTypes.wizards] = [
      testHelper.createMockCard(room, cardMap[ECardTypes.wizards][1]),
    ];

    await endTurn(room, activePlayer.nickname);

    expect(room.activePlayer).toEqual(otherPlayer);
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.deck.length).toBe(4);
    expect(room.sendInfo).toHaveBeenCalled();
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer закончил ход');
    expect(playTowerSpy).toHaveBeenCalledTimes(0);
    expect(prop3.play).toHaveBeenCalledTimes(1);
    expect(room.onCurrentTurn).toEqual(getEmptyOnCurrentTurn());
  });

  test('Не заканчивается ход без активного игрока', async () => {
    room.players = {};
    const hand = [...activePlayer.hand];

    await endTurn(room, activePlayer.nickname);

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

    await endTurn(room, activePlayer.nickname);

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

    await endTurn(room, activePlayer.nickname);

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

    await endTurn(room, activePlayer.nickname, true);

    expect(room.activePlayer).toEqual(otherPlayer);
    hand.forEach(card => {
      expect(activePlayer.hand.indexOf(card)).not.toBe(-1);
    });
    expect(activePlayer.discard.length).toBe(0);
    expect(topProp.played).toBeTruthy();
    expect(topCard.played).toBeFalsy();
    expect(topCard.playing).toBeFalsy();
    expect(room.sendInfo).toHaveBeenCalledTimes(1);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer закончил ход');
    expect(playTowerSpy).toHaveBeenCalledTimes(0);
    expect(prop3.play).toHaveBeenCalledTimes(0);
    expect(room.onCurrentTurn).toEqual(getEmptyOnCurrentTurn());
  });

  test('Если игрок, закончивший ход, получил в руку постоянку, то она не активируется сразу', async () => {
    const permanent = createMockCard(room, cardMap[ECardTypes.places][1])!;
    permanent.ownerNickname = activePlayer.nickname;
    activePlayer.deck = [permanent];

    await endTurn(room, activePlayer.nickname);

    expect(room.activePlayer).toEqual(otherPlayer);
    expect(activePlayer.activePermanent.length).toBe(0);
    expect(activePlayer.hand.length).toBe(5);
  });

  test('Если игрок не активный, то не может завершить ход', async () => {
    await endTurn(room, otherPlayer.nickname);

    expect(room.activePlayer).toEqual(activePlayer);
  });

  test('Не завершает ход дважды, если быстро нажать кнопку', async () => {
    await Promise.allSettled([
      endTurn(room, activePlayer.nickname),
      endTurn(room, activePlayer.nickname),
    ]);

    expect(room.activePlayer).toEqual(otherPlayer);
  });
});

describe('playTower', () => {
  let room: Room;
  let activePlayer: Player;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
    testHelper.addPlayerToRoom(room, activePlayer);
  });

  test('Разыгрывается', async () => {
    activePlayer.hasTower = true;
    const topCard = getLastElement(activePlayer.hand)!;

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [topCard] });

    await playTower(room, activePlayer);

    expect(activePlayer.selectCards).toHaveBeenCalledTimes(1);
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard.indexOf(topCard)).not.toBe(-1);
    expect(activePlayer.deck.length).toBe(4);
    expect(activePlayer.hand.length).toBe(5);
    expect(activePlayer.hand.indexOf(topCard)).toBe(-1);
  });

  test('Не разыгрывается дважды при быстром нажатии кнопки', async () => {
    activePlayer.hasTower = true;
    const topCard = getLastElement(activePlayer.hand)!;

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [topCard] });

    await Promise.allSettled([
      playTower(room, activePlayer),
      playTower(room, activePlayer),
    ]);

    expect(activePlayer.selectCards).toHaveBeenCalledTimes(1);
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard.indexOf(topCard)).not.toBe(-1);
    expect(activePlayer.deck.length).toBe(4);
    expect(activePlayer.hand.length).toBe(5);
    expect(activePlayer.hand.indexOf(topCard)).toBe(-1);
  });

  test('Не разыгрывается, если игра окончена', async () => {
    room.gameEnded = true;
    activePlayer.hasTower = true;

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

    await playTower(room, activePlayer);

    expect(activePlayer.selectCards).toHaveBeenCalledTimes(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.deck.length).toBe(5);
    expect(activePlayer.hand.length).toBe(5);
  });

  test('Не разыгрывается, если у игрока нет башни', async () => {
    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

    await playTower(room, activePlayer);

    expect(activePlayer.selectCards).toHaveBeenCalledTimes(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.deck.length).toBe(5);
    expect(activePlayer.hand.length).toBe(5);
  });

  test('Не разыгрывается, если у игрока нет сброса и колоды', async () => {
    activePlayer.hasTower = true;
    activePlayer.deck = [];

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

    await playTower(room, activePlayer);

    expect(activePlayer.selectCards).toHaveBeenCalledTimes(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.deck.length).toBe(0);
    expect(activePlayer.hand.length).toBe(5);
  });
});
