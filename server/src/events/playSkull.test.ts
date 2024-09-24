import { cardMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';
import { playSkull } from 'Event/playSkull';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('playSkull', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    consoleErrorSpy = testHelper.consoleErrorMockSpy();

    spyOn(room, 'logEvent');
    spyOn(room, 'sendInfo');
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
  });

  test('Не разыгрывается, если игра окончена', async () => {
    const skull = testHelper.createMockSkull({ room, id: 1 });
    testHelper.giveSkullToPlayer(skull, activePlayer);
    room.gameEnded = true;

    await playSkull({ room, skull });

    expect(activePlayer.discard.length).toBe(0);
    expect(room.sluggishStick.length).toBe(16);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
  });

  describe('skull 1', () => {
    test('Разыгрывается', async () => {
      const skull = testHelper.createMockSkull({ room, id: 1 });
      testHelper.giveSkullToPlayer(skull, activePlayer);
      const topCard = getLastElement(room.sluggishStick)!;

      await playSkull({ room, skull });

      expect(activePlayer.discard.indexOf(topCard)).not.toBe(-1);
      expect(room.sluggishStick.indexOf(topCard)).toBe(-1);
      expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer разыграл жетон дохлого колдуна');
    });

    test('Не разыгрывается, если нет палок', async () => {
      const skull = testHelper.createMockSkull({ room, id: 1 });
      testHelper.giveSkullToPlayer(skull, activePlayer);
      room.sluggishStick = [];

      await playSkull({ room, skull });

      expect(activePlayer.discard.length).toBe(0);
      expect(room.sluggishStick.length).toBe(0);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('skull 2', () => {
    test('Разыгрывается', async () => {
      const skull = testHelper.createMockSkull({ room, id: 2 });
      testHelper.giveSkullToPlayer(skull, activePlayer);

      await playSkull({ room, skull });

      expect(activePlayer.discard.length).toBe(2);
      expect(activePlayer.hand.length).toBe(3);
      expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer разыграл жетон дохлого колдуна');
    });

    test('Не разыгрывается, если нет руки', async () => {
      const skull = testHelper.createMockSkull({ room, id: 2 });
      testHelper.giveSkullToPlayer(skull, activePlayer);
      activePlayer.hand = [];

      await playSkull({ room, skull });

      expect(activePlayer.discard.length).toBe(0);
      expect(activePlayer.hand.length).toBe(0);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('skull 3', () => {
    test('Разыгрывается', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      card.ownerNickname = activePlayer.nickname;
      activePlayer.discard.push(card);
      const skull = testHelper.createMockSkull({ room, id: 3 });
      testHelper.giveSkullToPlayer(skull, activePlayer);

      spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [card] });

      await playSkull({ room, skull });

      expect(activePlayer.discard.length).toBe(0);
      expect(room.removed.cards.indexOf(card)).not.toBe(-1);
      expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer разыграл жетон дохлого колдуна');
    });

    test('Не разыгрывается, если нет сброса', async () => {
      const skull = testHelper.createMockSkull({ room, id: 3 });
      testHelper.giveSkullToPlayer(skull, activePlayer);

      await playSkull({ room, skull });

      expect(activePlayer.discard.length).toBe(0);
      expect(room.removed.cards.length).toBe(0);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('skull 4', () => {
    test('Разыгрывается', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.legends][1]);
      room.legends.push(card);
      const skull = testHelper.createMockSkull({ room, id: 4 });
      testHelper.giveSkullToPlayer(skull, activePlayer);

      spyOn(card, 'play').mockImplementation(async () => {});

      await playSkull({ room, skull });

      expect(card.play).toHaveBeenCalledWith({
        type: 'groupAttack',
        params: { target: activePlayer },
      });
      expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer разыграл жетон дохлого колдуна');
    });

    test('Не разыгрывается, если нет легенд', async () => {
      room.legends = [];
      const skull = testHelper.createMockSkull({ room, id: 4 });
      testHelper.giveSkullToPlayer(skull, activePlayer);

      await playSkull({ room, skull });

      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('skull 5', () => {
    test('Разыгрывается', async () => {
      const skull = testHelper.createMockSkull({ room, id: 5 });
      testHelper.giveSkullToPlayer(skull, activePlayer);
      const topCard = getLastElement(activePlayer.deck)!;

      spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [topCard], variant: 'otherPlayer' });

      await playSkull({ room, skull });

      expect(activePlayer.selectCards).toHaveBeenCalledTimes(1);
      expect(activePlayer.deck.indexOf(topCard)).toBe(-1);
      expect(otherPlayer.hand.indexOf(topCard)).not.toBe(-1);
      expect(room.logEvent).toHaveBeenNthCalledWith(2, 'Игрок activePlayer передал игроку otherPlayer карту на руку');
      expect(room.logEvent).toHaveBeenNthCalledWith(3, 'Игрок activePlayer разыграл жетон дохлого колдуна');
    });

    test('Замешивает колоду и разыгрывает', async () => {
      const skull = testHelper.createMockSkull({ room, id: 5 });
      testHelper.giveSkullToPlayer(skull, activePlayer);
      activePlayer.discard = [...activePlayer.deck];
      activePlayer.deck = [];

      spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [], variant: 'otherPlayer' });

      await playSkull({ room, skull });

      expect(activePlayer.selectCards).toHaveBeenCalledTimes(1);
      expect(room.logEvent).toHaveBeenNthCalledWith(3, 'Игрок activePlayer передал игроку otherPlayer карту на руку');
      expect(room.logEvent).toHaveBeenNthCalledWith(4, 'Игрок activePlayer разыграл жетон дохлого колдуна');
    });

    test('Не разыгрывается, если нет карт в сбросе и колоде', async () => {
      activePlayer.deck = [];
      const skull = testHelper.createMockSkull({ room, id: 5 });
      testHelper.giveSkullToPlayer(skull, activePlayer);

      spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [], variant: 'otherPlayer' });

      await playSkull({ room, skull });

      expect(activePlayer.selectCards).toHaveBeenCalledTimes(0);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('skull 6', () => {
    test('Разыгрывается', async () => {
      const skull = testHelper.createMockSkull({ room, id: 6 });
      testHelper.giveSkullToPlayer(skull, activePlayer);
      activePlayer.discard = [...activePlayer.deck];
      activePlayer.deck = [];

      await playSkull({ room, skull });

      expect(activePlayer.deck.length).toBe(0);
      expect(activePlayer.hand.length).toBe(5);
      expect(activePlayer.discard.length).toBe(4);
      expect(room.logEvent).toHaveBeenLastCalledWith('Игрок activePlayer разыграл жетон дохлого колдуна');
    });

    test('Не разыгрывается, если нет сброса', async () => {
      const skull = testHelper.createMockSkull({ room, id: 6 });
      testHelper.giveSkullToPlayer(skull, activePlayer);

      await playSkull({ room, skull });

      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('skull 7', () => {
    test('Разыгрывается', async () => {
      const skull = testHelper.createMockSkull({ room, id: 7 });
      testHelper.giveSkullToPlayer(skull, activePlayer);
      otherPlayer.discard = [...otherPlayer.deck];
      otherPlayer.deck = [];
      const topCard = getLastElement(otherPlayer.discard)!;

      spyOn(otherPlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [topCard] });

      await playSkull({ room, skull });

      expect(otherPlayer.selectCards).toHaveBeenCalledTimes(1);
      expect(otherPlayer.discard.indexOf(topCard)).toBe(-1);
      expect(activePlayer.discard.indexOf(topCard)).not.toBe(-1);
      expect(room.logEvent).toHaveBeenNthCalledWith(1, 'Игрок activePlayer разыграл жетон дохлого колдуна');
      expect(room.logEvent).toHaveBeenNthCalledWith(3, 'Игрок otherPlayer передал игроку activePlayer карту в сброс');
    });

    test('Не разыгрывается, если нет карт в сбросе', async () => {
      const skull = testHelper.createMockSkull({ room, id: 7 });
      testHelper.giveSkullToPlayer(skull, activePlayer);

      spyOn(otherPlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

      await playSkull({ room, skull });

      expect(otherPlayer.selectCards).toHaveBeenCalledTimes(0);
      expect(room.logEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe('skull 8', () => {
    test('Разыгрывается', async () => {
      const skull = testHelper.createMockSkull({ room, id: 8 });
      testHelper.giveSkullToPlayer(skull, activePlayer);
      const topCards = activePlayer.hand.slice(-3);

      spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: topCards });

      await playSkull({ room, skull });

      expect(activePlayer.selectCards).toHaveBeenCalledTimes(1);
      expect(activePlayer.discard.every(card => topCards.indexOf(card) !== -1)).toBeTruthy();
      expect(activePlayer.hand.every(card => topCards.indexOf(card) === -1)).toBeTruthy();
      expect(room.logEvent).toHaveBeenNthCalledWith(2, 'Игрок activePlayer разыграл жетон дохлого колдуна');
    });

    test('Не разыгрывается, если нет карт в руке', async () => {
      const skull = testHelper.createMockSkull({ room, id: 8 });
      testHelper.giveSkullToPlayer(skull, activePlayer);
      activePlayer.hand = [];

      spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

      await playSkull({ room, skull });

      expect(activePlayer.selectCards).toHaveBeenCalledTimes(0);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('skull 9', () => {
    test('Разыгрывается', async () => {
      const skull = testHelper.createMockSkull({ room, id: 9 });
      testHelper.giveSkullToPlayer(skull, otherPlayer);

      await playSkull({ room, skull, killer: activePlayer });

      expect(activePlayer.hp).toBe(12);
      expect(room.logEvent).toHaveBeenCalledWith('Игрок otherPlayer разыграл жетон дохлого колдуна');
    });

    test('Разыгрывается, если убивает атакующего, то дает замок', async () => {
      activePlayer.hp = 8;
      const skull = testHelper.createMockSkull({ room, id: 9 });
      testHelper.giveSkullToPlayer(skull, otherPlayer);
      room.skulls = [testHelper.createMockSkull({ room, id: 15 })];

      await playSkull({ room, skull, killer: activePlayer });

      expect(activePlayer.hp).toBe(20);
      expect(otherPlayer.hasTower).toBeTruthy();
      expect(activePlayer.hasTower).toBeFalsy();
      expect(room.logEvent).toHaveBeenCalledWith('Игрок otherPlayer разыграл жетон дохлого колдуна');
    });

    test('Не разыгрывается, если нет атакующего', async () => {
      const skull = testHelper.createMockSkull({ room, id: 9 });
      testHelper.giveSkullToPlayer(skull, otherPlayer);

      await playSkull({ room, skull });

      expect(activePlayer.hp).toBe(20);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('skull 10', () => {
    test('Разыгрывается', async () => {
      const skull = testHelper.createMockSkull({ room, id: 10 });
      testHelper.giveSkullToPlayer(skull, activePlayer);

      await playSkull({ room, skull });

      expect(activePlayer.discard[0].type).toBe(ECardTypes.sluggishStick);
      expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer разыграл жетон дохлого колдуна');
    });

    test('Не разыгрывается, если нет палок', async () => {
      const skull = testHelper.createMockSkull({ room, id: 10 });
      testHelper.giveSkullToPlayer(skull, activePlayer);
      room.sluggishStick = [];

      await playSkull({ room, skull });

      expect(activePlayer.discard.length).toBe(0);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('skull 11', () => {
    test('Разыгрывается', async () => {
      const skull = testHelper.createMockSkull({ room, id: 11 });
      testHelper.giveSkullToPlayer(skull, activePlayer);

      await playSkull({ room, skull });

      expect(activePlayer.hand.length).toBe(4);
      expect(room.removed.cards.length).toBe(1);
      expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer разыграл жетон дохлого колдуна');
    });

    test('Не разыгрывается, если нет руки', async () => {
      const skull = testHelper.createMockSkull({ room, id: 11 });
      testHelper.giveSkullToPlayer(skull, activePlayer);
      activePlayer.hand = [];

      await playSkull({ room, skull });

      expect(activePlayer.hand.length).toBe(0);
      expect(room.removed.cards.length).toBe(0);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('skull 12', () => {
    test('Разыгрывается', async () => {
      const skull = testHelper.createMockSkull({ room, id: 12 });
      testHelper.giveSkullToPlayer(skull, activePlayer);

      await playSkull({ room, skull });

      expect(activePlayer.hp).toBe(11);
      expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer разыграл жетон дохлого колдуна');
    });
  });

  describe('skull 13', () => {
    test('Разыгрывается', async () => {
      const skull = testHelper.createMockSkull({ room, id: 13 });
      testHelper.giveSkullToPlayer(skull, activePlayer);

      await playSkull({ room, skull });

      expect(activePlayer.discard.length).toBe(0);
      expect(activePlayer.deck.length).toBe(4);
      expect(activePlayer.hand.length).toBe(6);
      expect(room.logEvent).toHaveBeenNthCalledWith(2, 'Игрок activePlayer разыграл жетон дохлого колдуна');
    });

    test('Замешивает колоду и разыгрывает', async () => {
      const skull = testHelper.createMockSkull({ room, id: 13 });
      testHelper.giveSkullToPlayer(skull, activePlayer);
      activePlayer.discard = [...activePlayer.deck];
      activePlayer.deck = [];

      await playSkull({ room, skull });

      expect(activePlayer.discard.length).toBe(0);
      expect(activePlayer.deck.length).toBe(4);
      expect(activePlayer.hand.length).toBe(6);
      expect(room.logEvent).toHaveBeenNthCalledWith(3, 'Игрок activePlayer разыграл жетон дохлого колдуна');
    });

    test('Не разыгрывается, если нет карт в сбросе и колоде', async () => {
      activePlayer.deck = [];
      const skull = testHelper.createMockSkull({ room, id: 13 });
      testHelper.giveSkullToPlayer(skull, activePlayer);

      await playSkull({ room, skull });

      expect(activePlayer.discard.length).toBe(0);
      expect(activePlayer.deck.length).toBe(0);
      expect(activePlayer.hand.length).toBe(5);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('skull 14', () => {
    test('Не разыгрывается без обработчика', async () => {
      const skull = testHelper.createMockSkull({ room, id: 14 });
      testHelper.giveSkullToPlayer(skull, activePlayer);

      await playSkull({ room, skull });

      expect(activePlayer.discard.length).toBe(0);
      expect(activePlayer.deck.length).toBe(5);
      expect(activePlayer.hand.length).toBe(5);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('skull 15', () => {
    test('Не разыгрывается без обработчика', async () => {
      const skull = testHelper.createMockSkull({ room, id: 15 });
      testHelper.giveSkullToPlayer(skull, activePlayer);

      await playSkull({ room, skull });

      expect(activePlayer.discard.length).toBe(0);
      expect(activePlayer.deck.length).toBe(5);
      expect(activePlayer.hand.length).toBe(5);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('skull 16', () => {
    test('Не разыгрывается без обработчика', async () => {
      const skull = testHelper.createMockSkull({ room, id: 16 });
      testHelper.giveSkullToPlayer(skull, activePlayer);

      await playSkull({ room, skull });

      expect(activePlayer.discard.length).toBe(0);
      expect(activePlayer.deck.length).toBe(5);
      expect(activePlayer.hand.length).toBe(5);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('skull 17', () => {
    test('Не разыгрывается без обработчика', async () => {
      const skull = testHelper.createMockSkull({ room, id: 17 });
      testHelper.giveSkullToPlayer(skull, activePlayer);

      await playSkull({ room, skull });

      expect(activePlayer.discard.length).toBe(0);
      expect(activePlayer.deck.length).toBe(5);
      expect(activePlayer.hand.length).toBe(5);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('skull 18', () => {
    test('Не разыгрывается без обработчика', async () => {
      const skull = testHelper.createMockSkull({ room, id: 18 });
      testHelper.giveSkullToPlayer(skull, activePlayer);

      await playSkull({ room, skull });

      expect(activePlayer.discard.length).toBe(0);
      expect(activePlayer.deck.length).toBe(5);
      expect(activePlayer.hand.length).toBe(5);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('skull 19', () => {
    test('Не разыгрывается без обработчика', async () => {
      const skull = testHelper.createMockSkull({ room, id: 19 });
      testHelper.giveSkullToPlayer(skull, activePlayer);

      await playSkull({ room, skull });

      expect(activePlayer.discard.length).toBe(0);
      expect(activePlayer.deck.length).toBe(5);
      expect(activePlayer.hand.length).toBe(5);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe('skull 20', () => {
    test('Не разыгрывается без обработчика', async () => {
      const skull = testHelper.createMockSkull({ room, id: 20 });
      testHelper.giveSkullToPlayer(skull, activePlayer);

      await playSkull({ room, skull });

      expect(activePlayer.discard.length).toBe(0);
      expect(activePlayer.deck.length).toBe(5);
      expect(activePlayer.hand.length).toBe(5);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });
  });
});
