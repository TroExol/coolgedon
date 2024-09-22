import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';
import { playProp } from 'Event/playProp';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('playProp', () => {
  let room: Room;
  let activePlayer: Player;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
    testHelper.addPlayerToRoom(room, activePlayer);
    consoleErrorSpy = testHelper.consoleErrorMockSpy();

    spyOn(room, 'logEvent').mockImplementation(fn());
    spyOn(room, 'sendInfo').mockImplementation(fn());
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
  });

  test('Не разыгрывается, если игра окончена', async () => {
    const prop = testHelper.createMockProp({ room, ...propMap[1] });
    prop.ownerNickname = activePlayer.nickname;
    activePlayer.props = [prop];

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

    await playProp({ room, prop });

    expect(activePlayer.selectCards).toHaveBeenCalledTimes(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.deck.length).toBe(5);
  });

  test('Не разыгрывается, если свойство уже разыграно', async () => {
    const prop = testHelper.createMockProp({ room, ...propMap[1] });
    prop.ownerNickname = activePlayer.nickname;
    prop.played = true;
    activePlayer.props = [prop];

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

    await playProp({ room, prop });

    expect(activePlayer.selectCards).toHaveBeenCalledTimes(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.deck.length).toBe(5);
  });

  describe('prop 1', () => {
    test('Разыгрывается', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      card.ownerNickname = activePlayer.nickname;
      activePlayer.discard.push(card);
      const prop = testHelper.createMockProp({ room, ...propMap[1] });
      prop.ownerNickname = activePlayer.nickname;
      activePlayer.props = [prop];

      spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [card] });

      await playProp({ room, prop });

      expect(activePlayer.selectCards).toHaveBeenCalledTimes(1);
      expect(activePlayer.discard.indexOf(card)).toBe(-1);
      expect(activePlayer.deck.indexOf(card)).not.toBe(-1);
      expect(prop.played).toBeTruthy();
      expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer разыграл свойство');
    });

    test('Не разыгрывается, если не выбрана карта', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      card.ownerNickname = activePlayer.nickname;
      activePlayer.discard.push(card);
      const prop = testHelper.createMockProp({ room, ...propMap[1] });
      prop.ownerNickname = activePlayer.nickname;
      activePlayer.props = [prop];

      spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

      await playProp({ room, prop });

      expect(activePlayer.selectCards).toHaveBeenCalledTimes(1);
      expect(activePlayer.discard.indexOf(card)).not.toBe(-1);
      expect(activePlayer.deck.indexOf(card)).toBe(-1);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });

    test('Не разыгрывается, если нет сброса', async () => {
      const prop = testHelper.createMockProp({ room, ...propMap[1] });
      prop.ownerNickname = activePlayer.nickname;
      activePlayer.props = [prop];

      spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

      await playProp({ room, prop });

      expect(activePlayer.selectCards).toHaveBeenCalledTimes(0);
      expect(activePlayer.discard.length).toBe(0);
      expect(activePlayer.deck.length).toBe(5);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('prop 2', () => {
    test('Разыгрывается', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      testHelper.giveCardToPlayer(card, activePlayer);
      const prop = testHelper.createMockProp({ room, ...propMap[2] });
      prop.ownerNickname = activePlayer.nickname;
      activePlayer.props = [prop];

      await playProp({ room, prop, card });

      expect(prop.played).toBeFalsy();
      expect(activePlayer.hp).toBe(21);
      expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer разыграл свойство');
    });
  });

  describe('prop 3', () => {
    test('Разыгрывается', async () => {
      const prop = testHelper.createMockProp({ room, ...propMap[3] });
      prop.ownerNickname = activePlayer.nickname;
      activePlayer.props = [prop];
      room.onCurrentTurn.boughtOrReceivedCards.wizards = [{} as Card, {} as Card];

      await playProp({ room, prop });

      expect(prop.played).toBeFalsy();
      expect(activePlayer.hand.length).toBe(7);
      expect(activePlayer.deck.length).toBe(3);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок activePlayer разыграл свойство');
    });

    test('Не добавляет карт, если нет разыгранных волшебников', async () => {
      const prop = testHelper.createMockProp({ room, ...propMap[3] });
      prop.ownerNickname = activePlayer.nickname;
      activePlayer.props = [prop];

      await playProp({ room, prop });

      expect(prop.played).toBeFalsy();
      expect(activePlayer.hand.length).toBe(5);
      expect(activePlayer.deck.length).toBe(5);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('prop 4', () => {
    test('Разыгрывается', async () => {
      const prop = testHelper.createMockProp({ room, ...propMap[4] });
      prop.ownerNickname = activePlayer.nickname;
      activePlayer.props = [prop];

      await playProp({ room, prop });

      expect(prop.played).toBeTruthy();
      expect(activePlayer.hand.length).toBe(6);
      expect(activePlayer.deck.length).toBe(4);
      expect(activePlayer.hp).toBe(16);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок activePlayer разыграл свойство');
    });

    test('Не разыгрывается дважды при быстром нажатии кнопки', async () => {
      const prop = testHelper.createMockProp({ room, ...propMap[4] });
      prop.ownerNickname = activePlayer.nickname;
      activePlayer.props = [prop];

      await Promise.allSettled([
        playProp({ room, prop }),
        playProp({ room, prop }),
      ]);

      expect(prop.played).toBeTruthy();
      expect(prop.playing).toBeFalsy();
      expect(activePlayer.hand.length).toBe(6);
      expect(activePlayer.deck.length).toBe(4);
      expect(activePlayer.hp).toBe(16);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок activePlayer разыграл свойство');
    });
  });

  describe('prop 5', () => {
    test('Разыгрывается', async () => {
      const prop = testHelper.createMockProp({ room, ...propMap[5] });
      prop.ownerNickname = activePlayer.nickname;
      activePlayer.props = [prop];
      const topCard = getLastElement(activePlayer.deck)!;

      spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [topCard] });

      await playProp({ room, prop });

      expect(activePlayer.selectCards).toHaveBeenCalledTimes(1);
      expect(activePlayer.deck.indexOf(topCard)).toBe(-1);
      expect(activePlayer.discard.indexOf(topCard)).not.toBe(-1);
      expect(prop.played).toBeFalsy();
      expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer разыграл свойство');
    });

    test('Замешивает колоду и разыгрывает', async () => {
      const prop = testHelper.createMockProp({ room, ...propMap[5] });
      prop.ownerNickname = activePlayer.nickname;
      activePlayer.props = [prop];
      activePlayer.discard = [...activePlayer.deck];
      activePlayer.deck = [];
      const topCard = getLastElement(activePlayer.discard)!;

      spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [topCard] });

      await playProp({ room, prop });

      expect(activePlayer.selectCards).toHaveBeenCalledTimes(1);
      expect(activePlayer.deck.indexOf(topCard)).toBe(-1);
      expect(activePlayer.discard.indexOf(topCard)).not.toBe(-1);
      expect(prop.played).toBeFalsy();
      expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer разыграл свойство');
    });

    test('Не разыгрывается, если не выбрана карта', async () => {
      const prop = testHelper.createMockProp({ room, ...propMap[5] });
      prop.ownerNickname = activePlayer.nickname;
      activePlayer.props = [prop];
      const topCard = getLastElement(activePlayer.deck)!;

      spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

      await playProp({ room, prop });

      expect(activePlayer.selectCards).toHaveBeenCalledTimes(1);
      expect(activePlayer.deck.indexOf(topCard)).not.toBe(-1);
      expect(activePlayer.discard.indexOf(topCard)).toBe(-1);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });

    test('Не разыгрывается, если нет сброса и колоды', async () => {
      const prop = testHelper.createMockProp({ room, ...propMap[5] });
      prop.ownerNickname = activePlayer.nickname;
      activePlayer.props = [prop];
      activePlayer.deck = [];

      spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

      await playProp({ room, prop });

      expect(activePlayer.selectCards).toHaveBeenCalledTimes(0);
      expect(activePlayer.discard.length).toBe(0);
      expect(activePlayer.deck.length).toBe(0);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('prop 6', () => {
    test('Разыгрывается', async () => {
      const prop = testHelper.createMockProp({ room, ...propMap[6] });
      prop.ownerNickname = activePlayer.nickname;
      activePlayer.props = [prop];

      await playProp({ room, prop });

      expect(prop.played).toBeTruthy();
      expect(activePlayer.hand.length).toBe(6);
      expect(activePlayer.deck.length).toBe(4);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок activePlayer разыграл свойство');
    });
  });

  describe('prop 7', () => {
    test('Не разыгрывается без обработчика', async () => {
      const prop = testHelper.createMockProp({ room, ...propMap[7] });
      prop.ownerNickname = activePlayer.nickname;
      activePlayer.props = [prop];

      await playProp({ room, prop });

      expect(prop.played).toBeFalsy();
      expect(activePlayer.hand.length).toBe(5);
      expect(activePlayer.deck.length).toBe(5);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('prop 8', () => {
    test('Не разыгрывается без обработчика', async () => {
      const prop = testHelper.createMockProp({ room, ...propMap[8] });
      prop.ownerNickname = activePlayer.nickname;
      activePlayer.props = [prop];

      await playProp({ room, prop });

      expect(prop.played).toBeFalsy();
      expect(activePlayer.hand.length).toBe(5);
      expect(activePlayer.deck.length).toBe(5);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });
});
