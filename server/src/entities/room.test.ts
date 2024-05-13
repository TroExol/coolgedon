/* eslint-disable @typescript-eslint/no-explicit-any */
import type { WebSocket, WebSocketServer } from 'ws';

import { cardMap } from 'AvailableCards';
import { ECardTypes, EEventTypes, EModalTypes } from '@coolgedon/shared';

import type { Player } from 'Entity/player';

import * as testHelper from 'Helpers/tests';
import { getCardIn } from 'Helpers';
import { Room, wsClients, wsRequestDataQueue } from 'Entity/room';

import spyOn = jest.spyOn;
import restoreAllMocks = jest.restoreAllMocks;
import fn = jest.fn;

describe('Room', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = testHelper.consoleErrorMockSpy();
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
  });

  test('instance имеет дефолтные значения', () => {
    const room = new Room({} as WebSocketServer, '1', 'activePlayer');

    expect(room.name).toBe('1');
    expect(room.activeLawlessness).toBeUndefined();
    expect(room.crazyMagic.length).toBe(16);
    expect(room.crazyMagic.every(card => card.theSameType(ECardTypes.crazyMagic))).toBeTruthy();
    expect(room.deck.length).toBeGreaterThan(0);
    expect(getCardIn(room.deck, ECardTypes.creatures)).not.toBeUndefined();
    expect(getCardIn(room.deck, ECardTypes.lawlessnesses)).not.toBeUndefined();
    expect(getCardIn(room.deck, ECardTypes.places)).not.toBeUndefined();
    expect(getCardIn(room.deck, ECardTypes.spells)).not.toBeUndefined();
    expect(getCardIn(room.deck, ECardTypes.treasures)).not.toBeUndefined();
    expect(getCardIn(room.deck, ECardTypes.wizards)).not.toBeUndefined();
    expect(room.familiars.length).toBeGreaterThan(0);
    expect(room.familiars.every(card => card.theSameType(ECardTypes.familiars))).toBeTruthy();
    expect(room.gameEnded).toBeFalsy();
    expect(room.legends.length).toBeGreaterThan(0);
    expect(room.legends.every(card => card.theSameType(ECardTypes.legends))).toBeTruthy();
    expect(room.legends.slice(-1)[0].number).toBe(1);
    expect(room.logs.length).toBe(0);
    expect(room.onCurrentTurn).toEqual({
      activatedPermanents: [],
      powerWasted: 0,
      additionalPower: 0,
      playedCards: {},
      usedCards: {},
      boughtOrReceivedCards: {},
    });
    expect(room.players).toEqual({});
    expect(room.props.length).toBeGreaterThan(0);
    expect(room.removed.cards.length).toBe(0);
    expect(room.removed.lawlessnesses.length).toBeGreaterThanOrEqual(0);
    expect(room.shop.length).toBe(5);
    expect(room.skulls.length).toBeGreaterThan(0);
    expect(room.sluggishStick.length).toBe(16);
    expect(room.sluggishStick.every(card => card.theSameType(ECardTypes.sluggishStick))).toBeTruthy();
    expect(room.wasLawlessnessesOnCurrentTurn).toBeFalsy();
  });

  describe('changeActivePlayer', () => {
    test('Правильно меняет активного игрока', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);

      expect(room.activePlayer).toEqual(activePlayer);
      room.changeActivePlayer(otherPlayer);
      expect(room.activePlayer).toEqual(otherPlayer);
      room.changeActivePlayer(activePlayer.nickname);
      expect(room.activePlayer).toEqual(activePlayer);
    });

    test('Игрок хиляется с treasure 3 в начале хода', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);
      const treasure3 = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][3]);
      treasure3.ownerNickname = otherPlayer.nickname;
      otherPlayer.activePermanent.push(treasure3);

      room.changeActivePlayer(otherPlayer);
      expect(activePlayer.hp).toBe(20);
      expect(otherPlayer.hp).toBe(21);

      const place = testHelper.createMockCard(room, cardMap[ECardTypes.places][1]);
      place.ownerNickname = otherPlayer.nickname;
      otherPlayer.activePermanent.push(place);

      room.changeActivePlayer(activePlayer);
      expect(activePlayer.hp).toBe(20);
      expect(otherPlayer.hp).toBe(21);

      room.changeActivePlayer(otherPlayer);
      expect(activePlayer.hp).toBe(20);
      expect(otherPlayer.hp).toBe(23);
    });

    test('Игрок активирует постоянки в начале хода', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);
      const treasure3 = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][3]);
      testHelper.giveCardToPlayer(treasure3, otherPlayer);

      spyOn(otherPlayer, 'activatePermanents');

      room.changeActivePlayer(otherPlayer);
      expect(otherPlayer.activePermanent.indexOf(treasure3)).not.toBe(-1);
      expect(otherPlayer.hand.indexOf(treasure3)).toBe(-1);
      expect(otherPlayer.activatePermanents).toHaveBeenCalledTimes(1);
    });
  });

  describe('changeAdmin', () => {
    test('Правильно меняет админа', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);

      expect(room.admin).toEqual(activePlayer);
      room.changeAdmin(otherPlayer);
      expect(room.admin).toEqual(otherPlayer);
      room.changeAdmin(activePlayer.nickname);
      expect(room.admin).toEqual(activePlayer);
    });
  });

  describe('endGame', () => {
    test('Правильно заканчивает игру', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      testHelper.giveCardToPlayer(card, activePlayer);

      spyOn(room, 'sendInfo');
      spyOn(room, 'logEvent');

      room.endGame();
      expect(room.gameEnded).toBeTruthy();
      expect(room.sendInfo).toHaveBeenCalledTimes(1);
      expect(room.logEvent).toHaveBeenCalledWith('Игра окончена');
      expect(room.wsSendMessage).toHaveBeenLastCalledWith({
        event: EEventTypes.showModal,
        data: {
          modalType: EModalTypes.endGame,
          players: [
            activePlayer.format(activePlayer),
            otherPlayer.format(otherPlayer),
          ],
        },
      });
    });
  });

  describe('fillShop', () => {
    test('Правильно заполняет барахолку', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);

      spyOn(room, 'sendInfo');

      const countDeckCards = room.deck.length;
      await room.fillShop();
      expect(room.shop.length).toBe(5);
      expect(room.deck.length).toBe(countDeckCards);
      expect(room.gameEnded).toBeFalsy();
      expect(room.sendInfo).toHaveBeenCalledTimes(0);

      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      room.deck.push(card);
      room.shop.splice(-1);
      const countDeckCards2 = room.deck.length;

      await room.fillShop();
      expect(room.shop.length).toBe(5);
      expect(room.shop.indexOf(card)).not.toBe(-1);
      expect(room.deck.length).toBeLessThan(countDeckCards2);
      expect(room.gameEnded).toBeFalsy();
      expect(room.sendInfo).toHaveBeenCalledTimes(1);
    });

    test('Правильно разыгрывает беспредел', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const lawlessnesses = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][9]);
      room.deck.push(card);
      room.deck.push(lawlessnesses);

      spyOn(room, 'sendInfo');
      spyOn(room, 'logEvent');
      spyOn(lawlessnesses, 'play').mockImplementation(async () => {});

      room.shop.splice(-1);
      const countDeckCards = room.deck.length;

      await room.fillShop();
      expect(room.shop.length).toBe(5);
      expect(room.shop.indexOf(lawlessnesses)).toBe(-1);
      expect(room.shop.indexOf(card)).not.toBe(-1);
      expect(room.deck.length).toBe(countDeckCards - 2);
      expect(room.gameEnded).toBeFalsy();
      expect(room.logEvent).toHaveBeenCalledWith('БЕСПРЕДЕЕЕЛ!!!');
      expect(room.sendInfo).toHaveBeenCalledTimes(2);
      expect(room.wsSendMessage).toHaveBeenNthCalledWith(4, {
        event: EEventTypes.showModal,
        data: {
          modalType: EModalTypes.cards,
          cards: [lawlessnesses.format()],
          select: false,
        },
      }, [otherPlayer]);
      expect(room.wsSendMessageAsync).toHaveBeenLastCalledWith(activePlayer.nickname, {
        event: EEventTypes.showModal,
        data: {
          modalType: EModalTypes.playCard,
          card: lawlessnesses.format(),
          canClose: false,
        },
      });
      expect(lawlessnesses.play).toHaveBeenCalledWith({ type: 'lawlessness' });
    });

    test('Пропускается беспредел, если нельзя разыграть', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const lawlessnesses = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][14]);
      room.deck.push(card);
      room.deck.push(lawlessnesses);
      room.removed.lawlessnesses = [];

      spyOn(room, 'sendInfo');
      spyOn(room, 'logEvent');
      spyOn(lawlessnesses, 'play').mockImplementation(async () => {});

      room.shop.splice(-1);
      const countDeckCards = room.deck.length;

      await room.fillShop();
      expect(room.shop.length).toBe(5);
      expect(room.shop.indexOf(lawlessnesses)).toBe(-1);
      expect(room.deck.length).toBe(countDeckCards - 2);
      expect(room.removed.lawlessnesses).toEqual([lawlessnesses]);
      expect(room.gameEnded).toBeFalsy();
      expect(room.logEvent).toHaveBeenCalledTimes(0);
      expect(room.sendInfo).toHaveBeenCalledTimes(1);
      expect(lawlessnesses.play).toHaveBeenCalledTimes(0);
    });

    test('Заканчивается игра, когда нельзя пополнить магазин из колоды', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);

      spyOn(room, 'sendInfo');
      spyOn(room, 'logEvent');
      spyOn(room, 'endGame').mockImplementation(fn());

      room.deck = [];
      room.shop.splice(-1);

      await room.fillShop();
      expect(room.shop.length).toBe(4);
      expect(room.deck.length).toBe(0);
      expect(room.endGame).toHaveBeenCalledTimes(1);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
      expect(room.sendInfo).toHaveBeenCalledTimes(0);
    });

    test('Корректно заменяется карта', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      room.deck.push(card);

      spyOn(room, 'sendInfo');
      spyOn(room, 'logEvent');

      const shopCard3 = room.shop[2];
      const countDeckCards = room.deck.length;

      await room.fillShop({ replaceCards: [shopCard3] });
      expect(room.shop.length).toBe(5);
      expect(room.shop.indexOf(shopCard3)).toBe(-1);
      expect(room.shop[2]).toEqual(card);
      expect(room.deck.length).toBe(countDeckCards - 1);
    });
  });

  describe('format', () => {
    test('format возвращает корректные значения', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const countProps = room.props.length;
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);

      const formatted = room.format(activePlayer);
      expect(formatted.activeLawlessness).toBeUndefined();
      expect(formatted.activePlayerNickname).toBe('activePlayer');
      expect(formatted.adminNickname).toBe('activePlayer');
      expect(formatted.deck.length).toBe(room.deck.length);
      expect(formatted.playerNickname).toBe('activePlayer');
      expect(formatted.gameEnded).toBeFalsy();
      expect(formatted.legends.length).toBe(room.legends.length);
      expect(formatted.legends.slice(-1)[0].number).toBe(1);
      expect(formatted.name).toBe('1');
      expect(Object.keys(formatted.players)).toEqual(['activePlayer', 'otherPlayer']);
      expect(formatted.props.length).toBe(countProps - 2);
      expect(formatted.removed.cards).toEqual([]);
      expect(formatted.removed.lawlessnesses).not.toBeUndefined();
      expect(formatted.shop.length).toBe(5);
      expect(formatted.skulls.length).toBe(room.skulls.length);
      expect(formatted.crazyMagic.length).toBe(16);
      expect(formatted.sluggishStick.length).toBe(16);

      const formattedForOtherPlayer = room.format(otherPlayer);
      expect(formattedForOtherPlayer.playerNickname).toBe('otherPlayer');
    });
  });

  describe('getPlayedCards', () => {
    test('Корректно возвращает значения', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      room.onCurrentTurn.playedCards[ECardTypes.creatures] = [card];

      expect(room.getPlayedCards(ECardTypes.creatures)).toEqual([card]);
      expect(room.getPlayedCards(ECardTypes.wizards)).toEqual([]);
    });
  });

  describe('getPlayer', () => {
    test('Корректно возвращает значения', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);

      expect(room.getPlayer(activePlayer)).toEqual(activePlayer);
      expect(room.getPlayer(activePlayer.nickname)).toEqual(activePlayer);
      expect(room.getPlayer('otherPlayer')).toBeUndefined();
    });
  });

  describe('getPlayerByPos', () => {
    test('Корректно возвращает значения', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);

      expect(room.getPlayerByPos(activePlayer, 'left')).toBeUndefined();
      expect(room.getPlayerByPos(activePlayer, 'right')).toBeUndefined();

      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, otherPlayer);

      expect(room.getPlayerByPos(activePlayer, 'left')).toEqual(otherPlayer);
      expect(room.getPlayerByPos(activePlayer, 'right')).toEqual(otherPlayer);

      const otherPlayer2 = testHelper.createMockPlayer({ room, nickname: 'otherPlayer2' });
      testHelper.addPlayerToRoom(room, otherPlayer2);

      // activePlayer otherPlayer otherPlayer2 -> otherPlayer2 otherPlayer activePlayer
      expect(room.getPlayerByPos(activePlayer, 'left')).toEqual(otherPlayer);
      expect(room.getPlayerByPos('activePlayer', 'right')).toEqual(otherPlayer2);
    });
  });

  describe('getPlayersExceptPlayer', () => {
    test('Корректно возвращает значения', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);

      expect(room.getPlayersExceptPlayer(activePlayer)).toEqual([]);

      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, otherPlayer);

      expect(room.getPlayersExceptPlayer(activePlayer)).toEqual([otherPlayer]);
      expect(room.getPlayersExceptPlayer('activePlayer')).toEqual([otherPlayer]);

      const otherPlayer2 = testHelper.createMockPlayer({ room, nickname: 'otherPlayer2' });
      testHelper.addPlayerToRoom(room, otherPlayer2);

      expect(room.getPlayersExceptPlayer(activePlayer)).toEqual([otherPlayer, otherPlayer2]);
    });
  });

  describe('getWsClient', () => {
    test('Корректно возвращает значения', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');

      expect(room.getWsClient('activePlayer')).toBeUndefined();

      const ws = {} as WebSocket;
      wsClients['1'] = {};
      wsClients['1'].activePlayer = ws;

      expect(room.getWsClient('activePlayer')).toEqual(ws);

      delete wsClients['1'].activePlayer;
      delete wsClients['1'];
      expect(room.getWsClient('activePlayer')).toBeUndefined();
    });
  });

  describe('logEvent', () => {
    test('Корректно записывает логи', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');

      const dateSpy = spyOn(Date.prototype, 'toISOString').mockReturnValue('asd');

      room.logEvent('activePlayer');
      expect(room.logs.length).toBe(1);
      expect(room.logs[0].format().date).toBe('asd');
      expect(room.logs[0].format().msg).toBe('activePlayer');
      expect(room.wsSendMessage).toHaveBeenCalledWith({
        event: EEventTypes.sendLogs,
        data: room.logs.map(log => log.format()),
      });

      dateSpy.mockRestore();
    });
  });

  describe('removeActiveLawlessness', () => {
    test('Корректно удаляет активный беспредел', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const lawlessness = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][1]);
      room.removed.lawlessnesses = [];

      room.removeActiveLawlessness();

      expect(room.removed.lawlessnesses).toEqual([]);
      expect(room.activeLawlessness).toBeUndefined();

      room.activeLawlessness = lawlessness;

      room.removeActiveLawlessness();

      expect(room.removed.lawlessnesses).toEqual([lawlessness]);
      expect(room.activeLawlessness).toBeUndefined();
    });
  });

  describe('removeShopCards', () => {
    test('Корректно удаляет карты из магазина', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);

      const shop3 = room.shop[2];
      room.deck.push(card);

      spyOn(room, 'logEvent');

      await room.removeShopCards([shop3]);
      expect(room.shop.indexOf(shop3)).toBe(-1);
      expect(room.shop[2]).toEqual(card);
      expect(room.logEvent).toHaveBeenCalledWith('Удалено карт из магазина: 1 шт.');
    });
  });

  describe('sendInfo', () => {
    test('Корректно рассылает информацию', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);

      room.sendInfo();
      expect(room.wsSendMessage).toHaveBeenCalledTimes(2);
      expect(room.wsSendMessage).toHaveBeenNthCalledWith(1, {
        event: EEventTypes.updateInfo,
        data: room.format(activePlayer),
      }, [activePlayer]);
      expect(room.wsSendMessage).toHaveBeenNthCalledWith(2, {
        event: EEventTypes.updateInfo,
        data: room.format(otherPlayer),
      }, [otherPlayer]);
    });
  });

  describe('wsSendMessage', () => {
    let room: Room;
    let activePlayer: Player;
    let otherPlayer: Player;

    beforeEach(() => {
      room = testHelper.createMockRoom('1', 'activePlayer');
      activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      testHelper.addPlayerToRoom(room, otherPlayer);
      restoreAllMocks();
    });

    afterEach(() => {
      delete wsClients['1'];
    });

    test('Корректно рассылает информацию указанным игрокам', () => {
      wsClients['1'] = {};
      const ws = { send: spyOn({ send: () => {} }, 'send') } as any;
      wsClients['1'].activePlayer = ws;
      wsClients['1'].otherPlayer = ws;

      room.wsSendMessage('msg' as any, [activePlayer, otherPlayer]);
      expect(ws.send).toHaveBeenCalledTimes(2);
      expect(ws.send).toHaveBeenNthCalledWith(1, '"msg"');
      expect(ws.send).toHaveBeenNthCalledWith(2, '"msg"');
    });

    test('Корректно рассылает информацию всем игрокам', () => {
      wsClients['1'] = {};
      const ws = { send: spyOn({ send: () => {} }, 'send') } as any;
      wsClients['1'].activePlayer = ws;
      wsClients['1'].otherPlayer = ws;

      room.wsSendMessage('msg' as any);
      expect(ws.send).toHaveBeenCalledTimes(2);
      expect(ws.send).toHaveBeenNthCalledWith(1, '"msg"');
      expect(ws.send).toHaveBeenNthCalledWith(2, '"msg"');
    });

    test('Корректно рассылает информацию всем вебсокетам', () => {
      const ws = { send: spyOn({ send: () => {} }, 'send') } as any;

      room.wsSendMessage('msg' as any, [ws, ws]);
      expect(ws.send).toHaveBeenCalledTimes(2);
      expect(ws.send).toHaveBeenNthCalledWith(1, '"msg"');
      expect(ws.send).toHaveBeenNthCalledWith(2, '"msg"');
    });
  });

  describe('wsSendMessageAsync', () => {
    let room: Room;
    let activePlayer: Player;

    beforeEach(() => {
      room = testHelper.createMockRoom('1', 'activePlayer');
      activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      restoreAllMocks();
      spyOn(room, 'wsSendMessage').mockImplementation(fn());
    });

    afterEach(() => {
      delete wsClients['1'];
    });

    test('Корректно отправляет и получает информацию', async () => {
      wsClients['1'] = {};
      const ws = {} as WebSocket;
      wsClients['1'].activePlayer = ws;

      const receiver = room.wsSendMessageAsync(activePlayer.nickname, { msg: 'msg' } as any);
      const queue = Object.entries(wsRequestDataQueue)[0];
      queue[1].resolve('answer');
      const result = await receiver;
      expect(result).toBe('answer');
      expect(queue[1].receiverNickname).toBe(activePlayer.nickname);
      expect(queue[1].roomName).toBe(room.name);
      expect(room.wsSendMessage).toHaveBeenCalledWith({ requestId: queue[0], msg: 'msg' }, [ws]);
    });

    test('Корректно отправляет и получает информацию при reject', async () => {
      wsClients['1'] = {};
      const ws = {} as WebSocket;
      wsClients['1'].activePlayer = ws;

      const receiver = room.wsSendMessageAsync(activePlayer.nickname, { msg: 'msg' } as any);
      const queue = Object.entries(wsRequestDataQueue)[0];
      queue[1].reject(new Error('error'));
      await receiver
        .then(() => { throw new Error('data'); })
        .catch(e => {
          expect(e).toEqual(new Error('error'));
        });
      expect(room.wsSendMessage).toHaveBeenCalledWith({ requestId: queue[0], msg: 'msg' }, [ws]);
    });

    test('Ошибка при истечении таймаута', async () => {
      wsClients['1'] = {};
      const ws = {} as WebSocket;
      wsClients['1'].activePlayer = ws;

      const dateSpy = spyOn(Date.prototype, 'toLocaleString').mockReturnValue('asd');

      const receiver = room.wsSendMessageAsync(activePlayer.nickname, { msg: 'msg' } as any, { timeoutMs: 100 });
      const queue = Object.entries(wsRequestDataQueue)[0];
      await receiver
        .then(() => { throw new Error('data'); })
        .catch(e => {
          expect(e).toEqual(new Error('asd activePlayer не отвечает'));
        });
      expect(room.wsSendMessage).toHaveBeenCalledWith({ requestId: queue[0], msg: 'msg' }, [ws]);

      dateSpy.mockRestore();
    });

    test('Ошибка, если нет вебсокета у пользователя', async () => {
      const dateSpy = spyOn(Date.prototype, 'toLocaleString').mockReturnValue('asd');

      const receiver = room.wsSendMessageAsync(activePlayer.nickname, { msg: 'msg' } as any);
      await receiver
        .then(() => { throw new Error('data'); })
        .catch(e => {
          expect(e).toEqual(new Error('asd activePlayer не подключен к серверу'));
        });
      expect(Object.entries(wsRequestDataQueue).length).toBe(0);
      expect(room.wsSendMessage).toHaveBeenCalledTimes(0);

      dateSpy.mockRestore();
    });
  });

  describe('activePlayer', () => {
    test('Корректно возвращает значение', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      expect(room.activePlayer).toEqual(activePlayer);
    });
  });

  describe('admin', () => {
    test('Корректно возвращает значение', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      expect(room.admin).toEqual(activePlayer);
    });
  });

  describe('playersArray', () => {
    test('Корректно возвращает значение', async () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
      expect(room.playersArray).toEqual([activePlayer]);
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, otherPlayer);
      expect(room.playersArray).toEqual([activePlayer, otherPlayer]);
    });
  });
});
