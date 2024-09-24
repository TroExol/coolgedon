/* eslint-disable @typescript-eslint/no-explicit-any */
import { cardMap } from 'AvailableCards';
import { ECardTypes, type TSkull } from '@coolgedon/shared';

import * as testHelper from 'Helpers/tests';
import { getCardsIn, getLastElement, toPlayerVariant } from 'Helpers';
import { Skull } from 'Entity/skull';
import { Player } from 'Entity/player';
import { Card } from 'Entity/card';

const spyOn = jest.spyOn;

describe('Player', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = testHelper.consoleErrorMockSpy();
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
  });

  test('instance имеет дефолтные значения', () => {
    const room = testHelper.createMockRoom('1', 'activePlayer');
    const prop = testHelper.createMockProp({ room, id: 1, playable: false });
    const familiar = testHelper.createMockCard(room, { ...cardMap[ECardTypes.familiars][1] });
    const activePlayer = new Player({
      room,
      nickname: 'activePlayer',
      prop,
      familiarToBuy: familiar,
    });
    const startCards = [...activePlayer.deck, ...activePlayer.hand];

    expect(activePlayer.activePermanent).toStrictEqual([]);
    expect(activePlayer.discard).toStrictEqual([]);
    expect(startCards.length).toBe(10);
    expect(getCardsIn(startCards, ECardTypes.seeds, 1).length).toBe(6);
    expect(getCardsIn(startCards, ECardTypes.seeds, 2).length).toBe(1);
    expect(getCardsIn(startCards, ECardTypes.seeds, 3).length).toBe(3);
    expect(startCards.every(card => card.ownerNickname === 'activePlayer')).toBeTruthy();
    expect(activePlayer.familiarToBuy).toBe(familiar);
    expect(activePlayer.familiarToBuy?.ownerNickname).toBe('activePlayer');
    expect(activePlayer.hasTower).toBeFalsy();
    expect(activePlayer.hp).toBe(20);
    expect(activePlayer.nickname).toBe('activePlayer');
    expect(activePlayer.props).toStrictEqual([prop]);
    expect(activePlayer.props[0].ownerNickname).toStrictEqual('activePlayer');
    expect(activePlayer.skulls).toStrictEqual([]);
  });

  describe('activatePermanents', () => {
    test('Активирует постоянки', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.places][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.places][2]);
      const card3 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      testHelper.giveCardToPlayer(card, activePlayer);
      testHelper.giveCardToPlayer(card2, activePlayer);
      testHelper.giveCardToPlayer(card3, activePlayer);

      const activateSpy = spyOn(Card.prototype, 'activate');

      activePlayer.activatePermanents();
      expect(activateSpy).toHaveBeenCalledTimes(2);
      expect(room.onCurrentTurn.playedCards[ECardTypes.places]?.length).toBe(2);

      activePlayer.activatePermanents();
      expect(activateSpy).toHaveBeenCalledTimes(2);

      activateSpy.mockRestore();
    });

    test('Нельзя активировать постоянки не активному игроку', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.places][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.places][2]);
      testHelper.giveCardToPlayer(card, otherPlayer);
      testHelper.giveCardToPlayer(card2, otherPlayer);

      const activateSpy = spyOn(Card.prototype, 'activate');

      otherPlayer.activatePermanents();
      expect(activateSpy).toHaveBeenCalledTimes(0);
      expect(room.onCurrentTurn.playedCards[ECardTypes.places]).toBeUndefined();

      activateSpy.mockRestore();
    });
  });

  describe('canGuard', () => {
    test('Возвращает корректные значения', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const creature1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const familiars1 = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][1]);
      const skull17 = testHelper.createMockSkull({ room, id: 17 });

      expect(activePlayer.canGuard()).toBeFalsy();
      testHelper.giveCardToPlayer(creature1, activePlayer);
      expect(activePlayer.canGuard()).toBeFalsy();
      expect(activePlayer.canGuard(true)).toBeFalsy();
      activePlayer.skulls.push(skull17);
      expect(activePlayer.canGuard(true)).toBeFalsy();
      activePlayer.skulls = [];

      testHelper.giveCardToPlayer(familiars1, activePlayer);
      expect(activePlayer.canGuard()).toBeTruthy();
      expect(activePlayer.canGuard(true)).toBeTruthy();
      activePlayer.skulls.push(skull17);
      expect(activePlayer.canGuard(true)).toBeFalsy();
      activePlayer.skulls = [];
    });
  });

  describe('damage', () => {
    test('Наносит урон', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);

      spyOn(room, 'sendInfo');
      spyOn(room, 'logEvent');
      const playSpy = spyOn(Skull.prototype, 'play').mockImplementation(async () => {});

      otherPlayer.hasTower = true;
      expect(otherPlayer.damage({ damage: 4 })).toBeFalsy();
      expect(otherPlayer.hp).toBe(16);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игроку otherPlayer нанесли 4 урона');
      expect(room.sendInfo).toHaveBeenCalledTimes(1);
      expect(otherPlayer.skulls.length).toBe(0);
      expect(otherPlayer.hasTower).toBeTruthy();
      expect(activePlayer.hasTower).toBeFalsy();

      expect(otherPlayer.damage({ damage: 16 })).toBeTruthy();
      expect(otherPlayer.hp).toBe(20);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок otherPlayer умер');
      expect(room.sendInfo).toHaveBeenCalledTimes(3);
      expect(otherPlayer.skulls.length).toBe(1);
      expect(otherPlayer.hasTower).toBeTruthy();
      expect(activePlayer.hasTower).toBeFalsy();

      const place6 = testHelper.createMockCard(room, cardMap[ECardTypes.places][6]);
      place6.ownerNickname = 'activePlayer';
      activePlayer.activePermanent.push(place6);

      expect(otherPlayer.damage({ damage: 4, attacker: activePlayer })).toBeFalsy();
      expect(otherPlayer.hp).toBe(16);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок activePlayer нанес 4 урона игроку otherPlayer');
      expect(room.sendInfo).toHaveBeenCalledTimes(4);
      expect(otherPlayer.skulls.length).toBe(1);
      expect(otherPlayer.hasTower).toBeTruthy();
      expect(activePlayer.hasTower).toBeFalsy();
      expect(activePlayer.activePermanent.indexOf(place6)).not.toBe(-1);
      expect(activePlayer.discard.indexOf(place6)).toBe(-1);

      expect(otherPlayer.damage({ damage: 16, attacker: activePlayer })).toBeTruthy();
      expect(otherPlayer.hp).toBe(20);
      // Здесь есть logEvent и sendInfo у takeSkull
      // Здесь есть logEvent и sendInfo у discardCards
      expect(room.logEvent).toHaveBeenNthCalledWith(6, 'Игрок activePlayer убил игрока otherPlayer');
      expect(room.sendInfo).toHaveBeenCalledTimes(7);
      expect(otherPlayer.skulls.length).toBe(2);
      expect(otherPlayer.skulls[0].ownerNickname).toBe('otherPlayer');
      expect(activePlayer.hasTower).toBeTruthy();
      expect(otherPlayer.hasTower).toBeFalsy();
      expect(activePlayer.activePermanent.indexOf(place6)).toBe(-1);
      expect(activePlayer.discard.indexOf(place6)).not.toBe(-1);

      expect(otherPlayer.damage({ damage: 20, attacker: activePlayer, giveSkull: false })).toBeTruthy();
      expect(otherPlayer.hp).toBe(20);
      expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer убил игрока otherPlayer');
      expect(room.sendInfo).toHaveBeenCalledTimes(8);
      expect(otherPlayer.skulls.length).toBe(2);
      expect(activePlayer.hasTower).toBeTruthy();
      expect(otherPlayer.hasTower).toBeFalsy();

      playSpy.mockRestore();
    });
  });

  describe('discardCards', () => {
    test('Сбрасывает карты', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });

      spyOn(room, 'sendInfo');
      spyOn(room, 'logEvent');

      const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
      testHelper.giveCardToPlayer(card1, activePlayer);

      activePlayer.discardCards([card1], 'hand');
      expect(activePlayer.hand.indexOf(card1)).toBe(-1);
      expect(activePlayer.discard.indexOf(card1)).not.toBe(-1);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок activePlayer сбросил карт: 1 шт.');
      expect(room.sendInfo).toHaveBeenCalledTimes(1);
      activePlayer.discard = [];

      activePlayer.deck.push(card1, card2);

      activePlayer.discardCards([card1, card2], 'deck');
      expect(activePlayer.deck.indexOf(card1)).toBe(-1);
      expect(activePlayer.deck.indexOf(card2)).toBe(-1);
      expect(activePlayer.discard.indexOf(card1)).not.toBe(-1);
      expect(activePlayer.discard.indexOf(card2)).not.toBe(-1);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок activePlayer сбросил карт: 2 шт.');
      expect(room.sendInfo).toHaveBeenCalledTimes(2);
      activePlayer.discard = [];

      activePlayer.activePermanent.push(card1);

      activePlayer.discardCards([card1], 'activePermanent');
      expect(activePlayer.deck.indexOf(card1)).toBe(-1);
      expect(activePlayer.discard.indexOf(card1)).not.toBe(-1);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок activePlayer сбросил карт: 1 шт.');
      expect(room.sendInfo).toHaveBeenCalledTimes(3);
    });
  });

  describe('fillHand', () => {
    test('Заполняет руку', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const cards = activePlayer.hand.splice(-2);

      activePlayer.fillHand();
      expect(activePlayer.hand.length).toBe(5);
      activePlayer.deck.push(...cards);

      activePlayer.hand = [];

      activePlayer.fillHand();
      expect(activePlayer.hand.length).toBe(5);
    });

    test('Замешивает колоду и заполняет руку', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const cards = activePlayer.hand.splice(-3);
      activePlayer.discard.push(...cards, ...activePlayer.deck);
      activePlayer.deck = [];

      activePlayer.fillHand();
      expect(activePlayer.hand.length).toBe(5);
    });

    test('Активирует постоянки, если заполняется рука активного игрока', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.places][1]);
      card.ownerNickname = activePlayer.nickname;
      activePlayer.discard = [card];
      activePlayer.deck = [];
      activePlayer.hand.splice(-2);

      activePlayer.fillHand();
      expect(activePlayer.hand.length).toBe(3);
      expect(activePlayer.discard.length).toBe(0);
      expect(activePlayer.deck.length).toBe(0);
      expect(activePlayer.activePermanent.includes(card)).toBeTruthy();
    });
  });

  describe('format', () => {
    test('format возвращает корректные значения', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const prop = testHelper.createMockProp({ room, id: 1, playable: false });
      const familiar = testHelper.createMockCard(room, { ...cardMap[ECardTypes.familiars][1] });
      const activePlayer = testHelper.createMockPlayer({
        room,
        nickname: 'activePlayer',
        prop,
        familiarToBuy: familiar,
      });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
      const card3 = testHelper.createMockCard(room, cardMap[ECardTypes.places][1]);
      testHelper.giveCardToPlayer(card1, activePlayer);
      activePlayer.discard.push(card2);
      activePlayer.activePermanent.push(card3);

      const formatted = activePlayer.format(activePlayer);
      expect(formatted.activePermanent.length).toBe(1);
      expect(formatted.countDeck).toBe(5);
      expect(formatted.discard.length).toBe(1);
      expect(formatted.familiarToBuy?.id).toBe(familiar.id);
      expect(formatted.hand?.length).toBe(6);
      expect(formatted.countHand).toBe(6);
      expect(formatted.hasTower).toBeFalsy();
      expect(formatted.hasTowerC).toBeFalsy();
      expect(formatted.hp).toBe(20);
      expect(formatted.nickname).toBe('activePlayer');
      expect(formatted.totalPower).toBe(0);
      expect(formatted.props.length).toBe(1);
      expect(formatted.props[0].id).toBe(prop.id);
      expect(formatted.skulls.length).toBe(0);
      expect(formatted.victoryPoints).toBe(3);

      const formattedForOtherPlayer = activePlayer.format(otherPlayer);
      expect(formattedForOtherPlayer.activePermanent.length).toBe(1);
      expect(formattedForOtherPlayer.countDeck).toBe(5);
      expect(formattedForOtherPlayer.discard.length).toBe(1);
      expect(formattedForOtherPlayer.familiarToBuy?.id).toBe(familiar.id);
      expect(formattedForOtherPlayer.hand?.length).toBe(6);
      expect(formattedForOtherPlayer.countHand).toBe(6);
      expect(formattedForOtherPlayer.hasTower).toBeFalsy();
      expect(formattedForOtherPlayer.hasTowerC).toBeFalsy();
      expect(formattedForOtherPlayer.hp).toBe(20);
      expect(formattedForOtherPlayer.nickname).toBe('activePlayer');
      expect(formattedForOtherPlayer.totalPower).toBe(0);
      expect(formattedForOtherPlayer.props.length).toBe(1);
      expect(formattedForOtherPlayer.props[0].id).toBe(prop.id);
      expect(formattedForOtherPlayer.skulls.length).toBe(0);
      expect(formattedForOtherPlayer.victoryPoints).toBeUndefined();

      const formattedOtherPlayer = otherPlayer.format(otherPlayer);
      expect(formattedOtherPlayer.hand?.length).toBe(5);
      expect(formattedOtherPlayer.countHand).toBe(5);
      expect(formattedOtherPlayer.nickname).toBe('otherPlayer');
      expect(formattedOtherPlayer.totalPower).toBeUndefined();
      expect(formattedOtherPlayer.victoryPoints).toBe(0);

      const formattedOtherPlayerForActivePlayer = otherPlayer.format(activePlayer);
      expect(formattedOtherPlayerForActivePlayer.hand).toBeUndefined();
      expect(formattedOtherPlayerForActivePlayer.countHand).toBe(5);
      expect(formattedOtherPlayerForActivePlayer.nickname).toBe('otherPlayer');
      expect(formattedOtherPlayerForActivePlayer.totalPower).toBeUndefined();
      expect(formattedOtherPlayerForActivePlayer.victoryPoints).toBeUndefined();
    });
  });

  describe('getCard', () => {
    test('Возвращает корректные значения', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
      testHelper.giveCardToPlayer(card1, activePlayer);
      testHelper.giveCardToPlayer(card2, activePlayer);

      expect(activePlayer.getCard('hand', ECardTypes.creatures)).toEqual(card1);
      expect(activePlayer.getCard('hand', ECardTypes.creatures, 1)).toEqual(card1);
      expect(activePlayer.getCard('hand', ECardTypes.creatures, 2)).toEqual(card2);
      expect(activePlayer.getCard('hand', ECardTypes.spells)).toBeUndefined();
      expect(activePlayer.getCard('hand', ECardTypes.spells, 2)).toBeUndefined();

      activePlayer.discard.push(card2);
      expect(activePlayer.getCard('discard', ECardTypes.creatures)).toEqual(card2);
      expect(activePlayer.getCard('discard', ECardTypes.creatures, 1)).toBeUndefined();
      expect(activePlayer.getCard('discard', ECardTypes.creatures, 2)).toEqual(card2);
      expect(activePlayer.getCard('discard', ECardTypes.spells)).toBeUndefined();
      expect(activePlayer.getCard('discard', ECardTypes.spells, 2)).toBeUndefined();
    });
  });

  describe('getCards', () => {
    test('Возвращает корректные значения', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
      testHelper.giveCardToPlayer(card1, activePlayer);
      testHelper.giveCardToPlayer(card2, activePlayer);

      expect(activePlayer.getCards('hand', ECardTypes.creatures)).toEqual([card1, card2]);
      expect(activePlayer.getCards('hand', ECardTypes.creatures, 1)).toEqual([card1]);
      expect(activePlayer.getCards('hand', ECardTypes.creatures, 2)).toEqual([card2]);
      expect(activePlayer.getCards('hand', ECardTypes.spells)).toEqual([]);
      expect(activePlayer.getCards('hand', ECardTypes.spells, 2)).toEqual([]);

      activePlayer.discard.push(card2);
      expect(activePlayer.getCards('discard', ECardTypes.creatures)).toEqual([card2]);
      expect(activePlayer.getCards('discard', ECardTypes.creatures, 1)).toEqual([]);
      expect(activePlayer.getCards('discard', ECardTypes.creatures, 2)).toEqual([card2]);
      expect(activePlayer.getCards('discard', ECardTypes.spells)).toEqual([]);
      expect(activePlayer.getCards('discard', ECardTypes.spells, 2)).toEqual([]);
    });
  });

  describe('getCountCards', () => {
    test('Возвращает корректные значения', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
      testHelper.giveCardToPlayer(card1, activePlayer);
      testHelper.giveCardToPlayer(card2, activePlayer);

      expect(activePlayer.getCountCards('hand', ECardTypes.creatures)).toBe(2);
      expect(activePlayer.getCountCards('hand', ECardTypes.creatures, 1)).toBe(1);
      expect(activePlayer.getCountCards('hand', ECardTypes.creatures, 2)).toBe(1);
      expect(activePlayer.getCountCards('hand', ECardTypes.spells)).toBe(0);
      expect(activePlayer.getCountCards('hand', ECardTypes.spells, 2)).toBe(0);

      activePlayer.discard.push(card2);
      expect(activePlayer.getCountCards('discard', ECardTypes.creatures)).toBe(1);
      expect(activePlayer.getCountCards('discard', ECardTypes.creatures, 1)).toBe(0);
      expect(activePlayer.getCountCards('discard', ECardTypes.creatures, 2)).toBe(1);
      expect(activePlayer.getCountCards('discard', ECardTypes.spells)).toBe(0);
      expect(activePlayer.getCountCards('discard', ECardTypes.spells, 2)).toBe(0);
    });
  });

  describe('getProp', () => {
    test('Возвращает корректные значения', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const prop = testHelper.createMockProp({ room, id: 5, playable: false });
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop });
      testHelper.addPlayerToRoom(room, activePlayer);

      expect(activePlayer.getProp(5)).toEqual(prop);
      expect(activePlayer.getProp(1)).toBeUndefined();
    });
  });

  describe('getSkull', () => {
    test('Возвращает корректные значения', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const skull = testHelper.createMockSkull({ room, id: 5 });
      activePlayer.skulls.push(skull);

      expect(activePlayer.getSkull(5)).toEqual(skull);
      expect(activePlayer.getSkull(1)).toBeUndefined();
    });
  });

  describe('guard', () => {
    test('Позволяет разыграть защиту', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);
      const cardAttack = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const cardGuard = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][1]);
      testHelper.giveCardToPlayer(cardGuard, otherPlayer);

      spyOn(room, 'logEvent');
      spyOn(cardGuard, 'playGuard').mockImplementation(async () => {});
      spyOn(otherPlayer, 'selectGuardCard').mockImplementation(async () => cardGuard);

      expect(await otherPlayer.guard({ cardAttack })).toBeFalsy();
      expect(otherPlayer.selectGuardCard).toHaveBeenCalledTimes(1);
      expect(cardGuard.playGuard).toHaveBeenCalledTimes(1);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок otherPlayer защитился');
    });

    test('Позволяет разыграть защиту с жетоном 17 и без атаки беспредела', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);
      const cardAttack = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const cardGuard = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][1]);
      testHelper.giveCardToPlayer(cardGuard, otherPlayer);
      const skull17 = testHelper.createMockSkull({ room, id: 17 });
      otherPlayer.skulls.push(skull17);

      spyOn(room, 'logEvent');
      spyOn(cardGuard, 'playGuard').mockImplementation(async () => {});
      spyOn(otherPlayer, 'selectGuardCard').mockImplementation(async () => cardGuard);

      expect(await otherPlayer.guard({ cardAttack })).toBeFalsy();
      expect(otherPlayer.selectGuardCard).toHaveBeenCalledTimes(1);
      expect(cardGuard.playGuard).toHaveBeenCalledTimes(1);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок otherPlayer защитился');
    });

    test('Нельзя разыграть защиту не из руки или постоянки', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);
      const cardAttack = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const cardGuard = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][1]);
      otherPlayer.discard.push(cardGuard);

      spyOn(room, 'logEvent');
      spyOn(cardGuard, 'playGuard').mockImplementation(async () => {});
      spyOn(otherPlayer, 'selectGuardCard').mockImplementation(async () => cardGuard);

      expect(await otherPlayer.guard({ cardAttack })).toBeTruthy();
      expect(otherPlayer.selectGuardCard).toHaveBeenCalledTimes(0);
      expect(cardGuard.playGuard).toHaveBeenCalledTimes(0);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });

    test('Нельзя разыграть защиту, если не выбрана карта', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);
      const cardAttack = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const cardGuard = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][1]);
      testHelper.giveCardToPlayer(cardGuard, otherPlayer);

      spyOn(room, 'logEvent');
      spyOn(cardGuard, 'playGuard').mockImplementation(async () => {});
      spyOn(otherPlayer, 'selectGuardCard').mockImplementation(async () => undefined);

      expect(await otherPlayer.guard({ cardAttack })).toBeTruthy();
      expect(otherPlayer.selectGuardCard).toHaveBeenCalledTimes(1);
      expect(cardGuard.playGuard).toHaveBeenCalledTimes(0);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });

    test('Нельзя разыграть защиту, если играет беспредел, и нельзя от него защититься', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);
      const cardAttack = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const cardGuard = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][1]);
      testHelper.giveCardToPlayer(cardGuard, otherPlayer);
      const skull17 = testHelper.createMockSkull({ room, id: 17 });
      otherPlayer.skulls.push(skull17);

      spyOn(room, 'logEvent');
      spyOn(cardGuard, 'playGuard').mockImplementation(async () => {});
      spyOn(otherPlayer, 'selectGuardCard').mockImplementation(async () => cardGuard);

      expect(await otherPlayer.guard({ cardAttack, byLawlessness: true })).toBeTruthy();
      expect(otherPlayer.selectGuardCard).toHaveBeenCalledTimes(0);
      expect(cardGuard.playGuard).toHaveBeenCalledTimes(0);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('heal', () => {
    test('Правильно хилит', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);

      spyOn(room, 'logEvent');
      spyOn(room, 'sendInfo');

      activePlayer.heal(3);
      expect(activePlayer.hp).toBe(23);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок activePlayer восполнил здоровье на 3');
      expect(room.sendInfo).toHaveBeenCalledTimes(1);

      activePlayer.heal(10);
      expect(activePlayer.hp).toBe(25);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок activePlayer восполнил здоровье на 2');
      expect(room.sendInfo).toHaveBeenCalledTimes(2);
    });

    test('Правильно хилит с places 5', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const place5 = testHelper.createMockCard(room, cardMap[ECardTypes.places][5]);
      activePlayer.activePermanent.push(place5);

      spyOn(room, 'logEvent');
      spyOn(room, 'sendInfo');

      activePlayer.heal(2);
      expect(activePlayer.hp).toBe(24);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок activePlayer восполнил здоровье на 4');
      expect(room.sendInfo).toHaveBeenCalledTimes(1);

      activePlayer.hp = 1;

      activePlayer.heal(12);
      expect(activePlayer.hp).toBe(25);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок activePlayer восполнил здоровье на 24');
      expect(room.sendInfo).toHaveBeenCalledTimes(2);
    });
  });

  describe('removeCards', () => {
    test('Правильно удаляет карты', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
      activePlayer.hand.push(card1, card2);

      spyOn(room, 'logEvent');
      spyOn(room, 'sendInfo');

      await activePlayer.removeCards([card1], 'hand');
      expect(activePlayer.hand.length).toBe(6);
      expect(activePlayer.hand.indexOf(card1)).toBe(-1);
      expect(activePlayer.hand.indexOf(card2)).not.toBe(-1);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок activePlayer удалил карт: 1 шт.');
      expect(room.sendInfo).toHaveBeenCalledTimes(1);
      expect(room.removed.cards.indexOf(card1)).not.toBe(-1);
      expect(room.removed.cards.indexOf(card2)).toBe(-1);

      activePlayer.hand.push(card1);

      await activePlayer.removeCards([card1, card2], 'hand');
      expect(activePlayer.hand.length).toBe(5);
      expect(activePlayer.hand.indexOf(card1)).toBe(-1);
      expect(activePlayer.hand.indexOf(card2)).toBe(-1);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок activePlayer удалил карт: 2 шт.');
      expect(room.sendInfo).toHaveBeenCalledTimes(2);
      expect(room.removed.cards.indexOf(card1)).not.toBe(-1);
      expect(room.removed.cards.indexOf(card2)).not.toBe(-1);

      const sluggishStick = testHelper.createMockCard(room, cardMap[ECardTypes.sluggishStick]);
      const crazyMagic = testHelper.createMockCard(room, cardMap[ECardTypes.crazyMagic]);
      activePlayer.hand.push(sluggishStick, crazyMagic);

      await activePlayer.removeCards([sluggishStick, crazyMagic], 'hand');
      expect(activePlayer.hand.length).toBe(5);
      expect(activePlayer.hand.indexOf(sluggishStick)).toBe(-1);
      expect(activePlayer.hand.indexOf(crazyMagic)).toBe(-1);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок activePlayer удалил карт: 2 шт.');
      expect(room.sendInfo).toHaveBeenCalledTimes(3);
      expect(room.sluggishStick.length).toBe(17);
      expect(room.crazyMagic.length).toBe(17);
    });

    test('Правильно передает карты при удалении', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);
      const cthulhu = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][13]);
      cthulhu.ownerNickname = activePlayer.nickname;
      const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      activePlayer.discard.push(cthulhu);
      testHelper.giveCardToPlayer(card1, activePlayer);

      spyOn(room, 'logEvent');
      spyOn(room, 'sendInfo');
      spyOn(activePlayer, 'selectCards').mockImplementation(async () => ({ variant: otherPlayer.nickname, cards: [] }));

      await activePlayer.removeCards([card1], 'hand');
      expect(activePlayer.hand.length).toBe(5);
      expect(activePlayer.hand.indexOf(card1)).toBe(-1);
      expect(otherPlayer.discard.indexOf(card1)).not.toBe(-1);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок otherPlayer взял карт в сброс: 1 шт.');
      expect(room.sendInfo).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeSkulls', () => {
    test('Правильно удаляет жетоны', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      room.skulls = [];
      const skull1 = testHelper.createMockSkull({ room, id: 1 });
      const skull2 = testHelper.createMockSkull({ room, id: 2 });
      activePlayer.skulls.push(skull1, skull2);

      spyOn(room, 'logEvent');
      spyOn(room, 'sendInfo');

      activePlayer.removeSkulls([skull1, skull2]);
      expect(activePlayer.skulls.length).toBe(0);
      expect(room.skulls.length).toBe(2);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок activePlayer уничтожил жетонов дохлых колдунов из своей коллекции: 2 шт.');
      expect(room.sendInfo).toHaveBeenCalledTimes(1);
    });
  });

  describe('selectCards', () => {
    test('Правильно возвращает ответ от клиента, когда карт > count', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
      testHelper.giveCardToPlayer(card, activePlayer);

      spyOn(room, 'emitWithAck').mockImplementation(async () => ({ selectedCards: [card], variant: 1 }));

      const result = await activePlayer.selectCards({ cards: [card, card2], variants: [{ id: 1, value: '1' }] });
      expect(result.cards).toEqual([card]);
      expect(result.variant).toBe(1);
      expect(room.emitWithAck).toHaveBeenCalledTimes(1);
    });

    test('Правильно возвращает ответ от клиента, когда карт < count', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
      testHelper.giveCardToPlayer(card, activePlayer);

      spyOn(room, 'emitWithAck').mockImplementation(async () => ({ selectedCards: [card], variant: 1 }));

      const result = await activePlayer.selectCards({ cards: [card, card2], variants: [{ id: 1, value: '1' }], count: 3 });
      expect(result.cards).toEqual([card, card2]);
      expect(result.variant).toBe(1);
      expect(room.emitWithAck).toHaveBeenCalledTimes(1);
    });

    test('Правильно возвращает ответ от клиента, когда диалоговое окно закрыли', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
      testHelper.giveCardToPlayer(card, activePlayer);

      spyOn(room, 'emitWithAck').mockImplementation(async () => ({ closed: true }));

      const result = await activePlayer.selectCards({ cards: [card, card2], variants: [{ id: 1, value: '1' }], count: 3 });
      expect(result.cards).toEqual([]);
      expect(result.variant).toBeUndefined();
      expect(room.emitWithAck).toHaveBeenCalledTimes(1);
    });
  });

  describe('selectLeftUniqueCardTypes', () => {
    test('Правильно возвращает ответ от клиента', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
      testHelper.giveCardToPlayer(card, activePlayer);

      spyOn(room, 'emitWithAck').mockImplementation(async () => ({ selectedCards: [card] }) as any);

      const result = await activePlayer.selectLeftUniqueCardTypes({ cards: [card, card2] });
      expect(result).toEqual([card]);
      expect(room.emitWithAck).toHaveBeenCalledTimes(1);
    });

    test('Правильно возвращает ответ от клиента, когда диалоговое окно закрыли', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
      testHelper.giveCardToPlayer(card, activePlayer);

      spyOn(room, 'emitWithAck').mockImplementation(async () => ({ closed: true }));

      const result = await activePlayer.selectLeftUniqueCardTypes({ cards: [card, card2] });
      expect(result).toBeUndefined();
      expect(room.emitWithAck).toHaveBeenCalledTimes(1);
    });
  });

  describe('selectGuardCard', () => {
    test('Правильно возвращает ответ от клиента при наличии карты защиты', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][1]);
      const cardAttack = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      testHelper.giveCardToPlayer(card, activePlayer);

      spyOn(room, 'emitWithAck').mockImplementation(async () => ({ selectedCard: card }) as any);

      const result = await activePlayer.selectGuardCard({ cardAttack });
      expect(result).toEqual(card);
      expect(room.emitWithAck).toHaveBeenCalledTimes(1);
    });

    test('Правильно возвращает ответ от клиента, если окно закрыли', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][1]);
      const cardAttack = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      testHelper.giveCardToPlayer(card, activePlayer);

      spyOn(room, 'emitWithAck').mockImplementation(async () => ({ closed: true }));

      const result = await activePlayer.selectGuardCard({ cardAttack });
      expect(result).toBeUndefined();
      expect(room.emitWithAck).toHaveBeenCalledTimes(1);
    });

    test('Правильно возвращает результат, если карт защиты нет', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const cardAttack = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);

      spyOn(room, 'emitWithAck').mockImplementation((async () => {}) as any);

      const result = await activePlayer.selectGuardCard({ cardAttack });
      expect(result).toBeUndefined();
      expect(room.emitWithAck).toHaveBeenCalledTimes(0);
    });
  });

  describe('selectSkulls', () => {
    test('Правильно возвращает ответ от клиента, когда жетонов > count', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const skull1 = testHelper.createMockSkull({ room, id: 1 });
      const skull2 = testHelper.createMockSkull({ room, id: 2 });

      const emitWithAckSpy = spyOn(room, 'emitWithAck').mockImplementation(async () => ({ selectedSkulls: [skull1], variant: 1 }));

      const result = await activePlayer.selectSkulls({ skulls: [skull1, skull2], variants: [{ id: 1, value: '1' }] });
      expect(result.skulls).toEqual([skull1]);
      expect(result.variant).toBe(1);
      expect(room.emitWithAck).toHaveBeenCalledTimes(1);
      expect((emitWithAckSpy.mock.calls[0][2] as {skulls: TSkull[]}).skulls).toEqual([
        { id: 1 },
        { id: 2 },
      ]);
    });

    test('Правильно возвращает ответ от клиента, когда жетонов < count', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const skull1 = testHelper.createMockSkull({ room, id: 1 });
      const skull2 = testHelper.createMockSkull({ room, id: 2 });

      spyOn(room, 'emitWithAck').mockImplementation(async () => ({ selectedSkulls: [skull1], variant: 1 }));

      const result = await activePlayer.selectSkulls({ skulls: [skull1, skull2], variants: [{ id: 1, value: '1' }], count: 3 });
      expect(result.skulls).toEqual([skull1, skull2]);
      expect(result.variant).toBe(1);
      expect(room.emitWithAck).toHaveBeenCalledTimes(1);
    });

    test('Правильно возвращает ответ от клиента, когда диалоговое окно закрыли', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const skull1 = testHelper.createMockSkull({ room, id: 1 });
      const skull2 = testHelper.createMockSkull({ room, id: 2 });

      spyOn(room, 'emitWithAck').mockImplementation(async () => ({ closed: true }));

      const result = await activePlayer.selectSkulls({ skulls: [skull1, skull2], variants: [{ id: 1, value: '1' }], count: 3 });
      expect(result.skulls).toEqual([]);
      expect(result.variant).toBeUndefined();
      expect(room.emitWithAck).toHaveBeenCalledTimes(1);
    });
  });

  describe('selectTarget', () => {
    test('Правильно возвращает ответ от клиента', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);

      spyOn(activePlayer, 'selectVariant').mockImplementation(async () => 'otherPlayer');

      const result = await activePlayer.selectTarget();
      expect(result).toEqual(otherPlayer);
      expect(activePlayer.selectVariant).toHaveBeenCalledWith({
        variants: [toPlayerVariant(otherPlayer)],
        title: 'Выбери игрока для атаки',
      });
    });

    test('Правильно возвращает ответ, если передан target', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      const otherPlayer2 = testHelper.createMockPlayer({ room, nickname: 'otherPlayer2' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);
      testHelper.addPlayerToRoom(room, otherPlayer2);

      spyOn(activePlayer, 'selectVariant').mockImplementation(async () => 'otherPlayer2');

      const result = await activePlayer.selectTarget({ target: otherPlayer });
      expect(result).toEqual(otherPlayer);
      expect(activePlayer.selectVariant).toHaveBeenCalledTimes(0);
    });

    test('Правильно возвращает ответ, если передан targets', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      const otherPlayer2 = testHelper.createMockPlayer({ room, nickname: 'otherPlayer2' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);
      testHelper.addPlayerToRoom(room, otherPlayer2);

      spyOn(activePlayer, 'selectVariant').mockImplementation(async () => 'otherPlayer');

      const result = await activePlayer.selectTarget({ targetsToSelect: [otherPlayer] });
      expect(result).toEqual(otherPlayer);
      expect(activePlayer.selectVariant).toHaveBeenCalledWith({
        variants: [toPlayerVariant(otherPlayer)],
        title: 'Выбери игрока для атаки',
      });
    });

    test('Правильно возвращает ответ, если нет других игроков', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);

      spyOn(activePlayer, 'selectVariant').mockImplementation(async () => 'otherPlayer');

      const result = await activePlayer.selectTarget();
      expect(result).toBeUndefined();
      expect(activePlayer.selectVariant).toHaveBeenCalledTimes(0);
    });

    test('Правильно возвращает ответ, если окно было закрыто', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);

      spyOn(activePlayer, 'selectVariant').mockImplementation(async () => undefined);

      const result = await activePlayer.selectTarget();
      expect(result).toBeUndefined();
      expect(activePlayer.selectVariant).toHaveBeenCalledWith({
        variants: [toPlayerVariant(otherPlayer)],
        title: 'Выбери игрока для атаки',
      });
    });
  });

  describe('selectVariant', () => {
    test('Правильно возвращает ответ от клиента', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);

      spyOn(room, 'emitWithAck').mockImplementation(async () => ({ variant: 1 }));

      const result = await activePlayer.selectVariant<number>({ variants: [{ id: 1, value: '1' }] });
      expect(result).toBe(1);
      expect(room.emitWithAck).toHaveBeenCalledTimes(1);
    });

    test('Правильно возвращает ответ, если окно было закрыто', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);

      spyOn(room, 'emitWithAck').mockImplementation(async () => ({ closed: true }));

      const result = await activePlayer.selectVariant<number>({ variants: [{ id: 1, value: '1' }] });
      expect(result).toBeUndefined();
      expect(room.emitWithAck).toHaveBeenCalledTimes(1);
    });
  });

  describe('shuffleDiscardToDeck', () => {
    test('Правильно замешивает сброс в колоду', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const cards = activePlayer.hand.splice(-3);
      activePlayer.discard.push(...cards);

      activePlayer.shuffleDiscardToDeck();
      expect(activePlayer.discard).toEqual([]);
      expect(activePlayer.deck.length).toBe(8);

      const deck = [...activePlayer.deck];
      activePlayer.deck = [];
      activePlayer.discard.push(...deck);

      activePlayer.shuffleDiscardToDeck();
      expect(activePlayer.discard).toEqual([]);
      expect(activePlayer.deck.length).toBe(8);

      activePlayer.deck = [];
      activePlayer.discard = [];

      activePlayer.shuffleDiscardToDeck();
      expect(activePlayer.discard.length).toBe(0);
      expect(activePlayer.deck.length).toBe(0);
    });
  });

  describe('takeCardsTo', () => {
    test('Правильно передает карты', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      card.played = true;
      room.deck.push(card);

      spyOn(room, 'sendInfo');
      spyOn(room, 'logEvent');
      spyOn(room, 'endGame');

      activePlayer.takeCardsTo('discard', [card], room.deck);
      expect(activePlayer.discard.indexOf(card)).not.toBe(-1);
      expect(card.ownerNickname).toBe(activePlayer.nickname);
      expect(card.played).toBeTruthy();
      expect(room.deck.indexOf(card)).toBe(-1);
      expect(room.onCurrentTurn.boughtOrReceivedCards[card.type]?.indexOf(card)).not.toBe(-1);
      expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer взял карт в сброс: 1 шт.');
      expect(room.sendInfo).toHaveBeenCalledTimes(1);

      room.deck.reverse();
      const topCard = room.deck.find(c => !c.theSameType(ECardTypes.lawlessnesses))!;
      room.deck.reverse();

      activePlayer.takeCardsTo('discard', 1, room.deck);
      expect(activePlayer.discard.indexOf(topCard)).not.toBe(-1);
      expect(topCard.ownerNickname).toBe(activePlayer.nickname);
      expect(room.deck.indexOf(topCard)).toBe(-1);
      expect(room.onCurrentTurn.boughtOrReceivedCards[topCard.type]?.indexOf(topCard)).not.toBe(-1);

      room.deck.reverse();
      const topCard2 = room.deck.find(c => !c.theSameType(ECardTypes.lawlessnesses))!;
      room.deck.reverse();

      otherPlayer.takeCardsTo('discard', 1, room.deck);
      expect(otherPlayer.discard.indexOf(topCard2)).not.toBe(-1);
      expect(topCard2.ownerNickname).toBe(otherPlayer.nickname);
      expect(room.deck.indexOf(topCard2)).toBe(-1);
      expect((room.onCurrentTurn.boughtOrReceivedCards[topCard2.type] || []).indexOf(topCard2)).toBe(-1);

      expect(room.endGame).toHaveBeenCalledTimes(0);

      const topCard3 = getLastElement(otherPlayer.deck)!;

      activePlayer.takeCardsTo('discard', 1, otherPlayer.deck);
      expect(activePlayer.discard.indexOf(topCard3)).not.toBe(-1);
      expect(otherPlayer.deck.indexOf(topCard3)).toBe(-1);
      expect(topCard3.ownerNickname).toBe(activePlayer.nickname);

      const topCard4 = getLastElement(otherPlayer.deck)!;

      activePlayer.takeCardsTo('discard', [topCard4], otherPlayer.deck);
      expect(activePlayer.discard.indexOf(topCard4)).not.toBe(-1);
      expect(otherPlayer.deck.indexOf(topCard4)).toBe(-1);
      expect(topCard4.ownerNickname).toBe(activePlayer.nickname);
    });

    test('Правильно замешивает колоду, если не хватает карт, и передает карты', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const cards = activePlayer.deck.splice(-3);
      activePlayer.discard.push(...cards);

      activePlayer.takeCardsTo('hand', 5, activePlayer.deck);
      expect(activePlayer.hand.length).toBe(10);
      expect(activePlayer.deck.length).toBe(0);
      expect(activePlayer.discard.length).toBe(0);
      expect(room.onCurrentTurn.boughtOrReceivedCards).toEqual({});
    });

    test('Беспределы не передаются и удаляются', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const lawlessnesses = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][1]);
      room.deck.push(card);
      room.deck.push(lawlessnesses);

      activePlayer.takeCardsTo('hand', 1, room.deck);
      expect(activePlayer.hand.length).toBe(6);
      expect(activePlayer.hand.indexOf(lawlessnesses)).toBe(-1);
      expect(room.removed.lawlessnesses.indexOf(lawlessnesses)).not.toBe(-1);
    });

    test('Активирует постоянки, если берутся в руку', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.places][1]);
      card.ownerNickname = activePlayer.nickname;
      activePlayer.discard.push(card);

      activePlayer.takeCardsTo('hand', [card], activePlayer.discard);
      expect(activePlayer.hand.length).toBe(5);
      expect(activePlayer.activePermanent.indexOf(card)).not.toBe(-1);
      expect(activePlayer.discard.indexOf(card)).toBe(-1);
      expect(room.onCurrentTurn.boughtOrReceivedCards.places).toBeUndefined();
    });

    test('Окончание игры, если закончились карты в колоде', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      room.deck = [card];

      spyOn(room, 'endGame');

      activePlayer.takeCardsTo('hand', 1, room.deck);
      expect(activePlayer.hand.length).toBe(6);
      expect(activePlayer.hand.indexOf(card)).not.toBe(-1);
      expect(room.deck.length).toBe(0);
      expect(room.onCurrentTurn.boughtOrReceivedCards.creatures).toEqual([card]);
      expect(room.endGame).toHaveBeenCalledTimes(1);
    });
  });

  describe('takeSkull', () => {
    test('Правильно передает жетон', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const skull = room.skulls.slice(-1)[0];

      spyOn(room, 'sendInfo');
      spyOn(room, 'logEvent');

      activePlayer.takeSkull(skull, room.skulls);

      expect(activePlayer.skulls.indexOf(skull)).not.toBe(-1);
      expect(room.skulls.indexOf(skull)).toBe(-1);
      expect(room.sendInfo).toHaveBeenCalledTimes(1);
      expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer получил жетон дохлого колдуна');
    });
  });

  describe('theSame', () => {
    test('Корректно сравнивает игроков', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });

      expect(activePlayer.theSame(activePlayer)).toBeTruthy();
      expect(activePlayer.theSame(otherPlayer)).toBeFalsy();
    });
  });

  describe('allCards', () => {
    test('Корректно возвращает все карты', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.places][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      activePlayer.activePermanent.push(card1);
      activePlayer.discard.push(card2);

      const allCards = activePlayer.allCards;
      expect(allCards.length).toBe(12);
      expect(allCards.indexOf(card1)).not.toBe(-1);
      expect(allCards.indexOf(card2)).not.toBe(-1);
    });
  });

  describe('countActivePermanents', () => {
    test('Корректно возвращает значение', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.places][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.places][2]);

      expect(activePlayer.countActivePermanents).toBe(0);

      activePlayer.activePermanent.push(card1);
      activePlayer.discard.push(card2);

      expect(activePlayer.countActivePermanents).toBe(1);

      activePlayer.hasTower = true;

      expect(activePlayer.countActivePermanents).toBe(2);

      const creature13 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][13]);
      testHelper.giveCardToPlayer(creature13, activePlayer);

      expect(activePlayer.countActivePermanents).toBe(3);

      const skull16 = testHelper.createMockSkull({ room, id: 16 });
      const skull17 = testHelper.createMockSkull({ room, id: 17 });
      const skull18 = testHelper.createMockSkull({ room, id: 18 });
      const skull19 = testHelper.createMockSkull({ room, id: 19 });
      const skull20 = testHelper.createMockSkull({ room, id: 20 });
      activePlayer.skulls.push(skull16, skull17, skull18, skull19, skull20);

      expect(activePlayer.countActivePermanents).toBe(8);
    });
  });

  describe('countSkulls', () => {
    test('Корректно возвращает значение', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });

      expect(activePlayer.countSkulls).toBe(0);

      const treasure13 = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][13]);
      activePlayer.activePermanent.push(treasure13);

      expect(activePlayer.countSkulls).toBe(1);

      const skull16 = testHelper.createMockSkull({ room, id: 16 });
      const skull17 = testHelper.createMockSkull({ room, id: 17 });
      const skull18 = testHelper.createMockSkull({ room, id: 18 });
      const skull19 = testHelper.createMockSkull({ room, id: 19 });
      const skull20 = testHelper.createMockSkull({ room, id: 20 });
      activePlayer.skulls.push(skull16, skull17, skull18, skull19, skull20);

      expect(activePlayer.countSkulls).toBe(6);
    });
  });

  describe('guardCards', () => {
    test('Корректно возвращает значение', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });

      expect(activePlayer.guardCards).toEqual([]);

      const card = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][1]);
      testHelper.giveCardToPlayer(card, activePlayer);

      expect(activePlayer.guardCards).toEqual([card]);

      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][2]);
      const card3 = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][2]);
      activePlayer.activePermanent.push(card2);
      activePlayer.hand.push(card3);

      expect(activePlayer.guardCards).toEqual([card, card2]);
    });
  });

  describe('hasTowerC', () => {
    test('Корректно возвращает значение', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });

      expect(activePlayer.hasTowerC).toBeFalsy();

      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][13]);
      testHelper.giveCardToPlayer(card, activePlayer);

      expect(activePlayer.hasTowerC).toBeTruthy();

      card.ownerNickname = 'otherPlayer';
      card.tempOwnerNickname = 'activePlayer';

      expect(activePlayer.hasTowerC).toBeFalsy();
    });
  });

  describe('totalPower', () => {
    test('Корректно возвращает значение', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
      testHelper.giveCardToPlayer(card1, activePlayer);
      testHelper.giveCardToPlayer(card2, activePlayer);
      activePlayer.props = [];

      expect(activePlayer.totalPower).toBe(0);

      card1.markAsPlayed();
      card2.markAsPlayed();
      expect(activePlayer.totalPower).toBe(4);

      room.onCurrentTurn.additionalPower = 4;
      expect(activePlayer.totalPower).toBe(8);

      const prop6 = testHelper.createMockProp({ room, id: 6, playable: false });
      activePlayer.props = [prop6];
      expect(activePlayer.totalPower).toBe(8);
      room.onCurrentTurn.playedCards.spells = [];
      room.onCurrentTurn.playedCards.treasures = [];
      room.onCurrentTurn.playedCards.familiars = [];
      expect(activePlayer.totalPower).toBe(9);

      const prop7 = testHelper.createMockProp({ room, id: 7, playable: false });
      activePlayer.props.push(prop7);
      expect(activePlayer.totalPower).toBe(11);
      room.onCurrentTurn.playedCards.wizards = [card1, card2];
      // + 4 от карт
      expect(activePlayer.totalPower).toBe(17);

      room.onCurrentTurn.playedCards.creatures!
        .push(testHelper.createMockCard(room, cardMap[ECardTypes.creatures][11]));
      expect(activePlayer.totalPower).toBe(18);
      const skull1 = testHelper.createMockSkull({ room, id: 1 });
      const skull2 = testHelper.createMockSkull({ room, id: 2 });
      activePlayer.skulls.push(skull1, skull2);
      expect(activePlayer.totalPower).toBe(20);
      room.onCurrentTurn.playedCards.creatures!
        .push(testHelper.createMockCard(room, cardMap[ECardTypes.creatures][11]));
      expect(activePlayer.totalPower).toBe(23);

      const familiar2 = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][2]);
      testHelper.giveCardToPlayer(familiar2, activePlayer);
      familiar2.markAsPlayed();
      expect(activePlayer.totalPower).toBe(26);
      const treasure = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][1]);
      activePlayer.discard.push(treasure, treasure, treasure);
      expect(activePlayer.totalPower).toBe(29);

      const familiar6 = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][6]);
      testHelper.giveCardToPlayer(familiar6, activePlayer);
      familiar6.markAsPlayed();
      expect(activePlayer.totalPower).toBe(32);
      const spell = testHelper.createMockCard(room, cardMap[ECardTypes.spells][3]);
      activePlayer.discard.push(spell, spell, spell);
      expect(activePlayer.totalPower).toBe(35);

      const familiar8 = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][8]);
      testHelper.giveCardToPlayer(familiar8, activePlayer);
      expect(activePlayer.totalPower).toBe(35);
      familiar8.markAsPlayed();
      expect(activePlayer.totalPower).toBe(39);

      const wizard13 = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][13]);
      testHelper.giveCardToPlayer(wizard13, activePlayer);
      expect(activePlayer.totalPower).toBe(39);
      wizard13.markAsPlayed();
      expect(activePlayer.totalPower).toBe(42);

      const legend11 = testHelper.createMockCard(room, cardMap[ECardTypes.legends][11]);
      testHelper.giveCardToPlayer(legend11, activePlayer);
      expect(activePlayer.totalPower).toBe(42);
      legend11.markAsPlayed();
      expect(activePlayer.totalPower).toBe(84);

      room.onCurrentTurn.powerWasted = 40;
      expect(activePlayer.totalPower).toBe(44);
    });
  });

  describe('victoryPoints', () => {
    test('Корректно возвращает значение', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);

      expect(activePlayer.victoryPoints).toBe(0);

      testHelper.giveCardToPlayer(card1, activePlayer);
      testHelper.giveCardToPlayer(card2, activePlayer);
      expect(activePlayer.victoryPoints).toBe(2);

      const skull1 = testHelper.createMockSkull({ room, id: 1 });
      const skull2 = testHelper.createMockSkull({ room, id: 2 });
      activePlayer.skulls.push(skull1, skull2);
      expect(activePlayer.victoryPoints).toBe(-4);

      const skull14 = testHelper.createMockSkull({ room, id: 14 });
      activePlayer.skulls.push(skull14);
      expect(activePlayer.victoryPoints).toBe(-9);

      const skull15 = testHelper.createMockSkull({ room, id: 15 });
      activePlayer.skulls.push(skull15);
      expect(activePlayer.victoryPoints).toBe(-16);
    });
  });
});
