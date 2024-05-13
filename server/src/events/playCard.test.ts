import { cardMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';

import * as testHelper from 'Helpers/tests';
import {
  playCardByLawlessness, playGroupAttack, playLawlessness, playPermanent, simplePlayCard,
} from 'Event/playCard';
import * as playGroupAttackHandler from 'CardHandler/legendGroupAttack';

import spyOn = jest.spyOn;
import restoreAllMocks = jest.restoreAllMocks;
import mock = jest.mock;
import fn = jest.fn;

describe('playCard', () => {
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
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
  });

  describe('simplePlayCard', () => {
    test('Разыгрывается карта', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      testHelper.giveCardToPlayer(card, activePlayer);

      const handlerMock = fn().mockResolvedValue(null);
      mock('../cardHandlers/creatures/1', () => ({
        default: handlerMock,
      }));

      const playCard = simplePlayCard({
        room,
        card,
        cardUsedByPlayer: true,
      });

      expect(card.playing).toBeTruthy();

      await playCard;

      expect(card.playing).toBeFalsy();
      expect(handlerMock).toHaveBeenCalledTimes(1);
      expect(handlerMock.mock.calls[0][0].room).toEqual(room);
      expect(handlerMock.mock.calls[0][0].card).toEqual(card);
      expect(handlerMock.mock.calls[0][0].target).toBeUndefined();
      expect(handlerMock.mock.calls[0][0].player).toEqual(activePlayer);
      expect(handlerMock.mock.calls[0][0].attacker).toEqual(activePlayer);
      expect(handlerMock.mock.calls[0][0].cardUsedByPlayer).toBeTruthy();
      expect(handlerMock.mock.calls[0][0].canGuard).toBeTruthy();
      expect(handlerMock.mock.calls[0][0].byLawlessness).toBeFalsy();
      expect(handlerMock.mock.calls[0][0].damage).toBeUndefined();

      restoreAllMocks();
    });

    test('Нельзя разыгрывать без активного игрока', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      testHelper.giveCardToPlayer(card, activePlayer);
      room.players = {};

      const handlerMock = fn().mockResolvedValue(null);
      mock('../cardHandlers/creatures/1', () => ({
        default: handlerMock,
      }));

      const playCard = simplePlayCard({
        room,
        card,
        cardUsedByPlayer: true,
      });

      expect(card.playing).toBeFalsy();

      await playCard;

      expect(card.playing).toBeFalsy();
      expect(handlerMock).toHaveBeenCalledTimes(0);

      restoreAllMocks();
    });

    test('Нельзя разыгрывать, если игра закончена', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      testHelper.giveCardToPlayer(card, activePlayer);
      room.gameEnded = true;

      const handlerMock = fn().mockResolvedValue(null);
      mock('../cardHandlers/creatures/1', () => ({
        default: handlerMock,
      }));

      const playCard = simplePlayCard({
        room,
        card,
        cardUsedByPlayer: true,
      });

      expect(card.playing).toBeFalsy();

      await playCard;

      expect(card.playing).toBeFalsy();
      expect(handlerMock).toHaveBeenCalledTimes(0);

      restoreAllMocks();
    });

    test('Нельзя разыгрывать беспредел', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][1]);
      testHelper.giveCardToPlayer(card, activePlayer);

      const handlerMock = fn().mockResolvedValue(null);
      mock('../cardHandlers/lawlessnesses/1', () => ({
        default: handlerMock,
      }));

      const playCard = simplePlayCard({
        room,
        card,
      });

      expect(card.playing).toBeFalsy();

      await playCard;

      expect(card.playing).toBeFalsy();
      expect(handlerMock).toHaveBeenCalledTimes(0);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Ошибка разыгрывания карты type: lawlessnesses number: 1',
        new Error('Для разыгрывания беспредела нужно вызывать playLawlessness'),
      );

      restoreAllMocks();
    });

    test('Нельзя разыгрывать постоянку', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.places][1]);
      testHelper.giveCardToPlayer(card, activePlayer);

      const handlerMock = fn().mockResolvedValue(null);
      mock('../cardHandlers/places/1', () => ({
        default: handlerMock,
      }));

      const playCard = simplePlayCard({
        room,
        card,
      });

      expect(card.playing).toBeFalsy();

      await playCard;

      expect(card.playing).toBeFalsy();
      expect(handlerMock).toHaveBeenCalledTimes(0);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Ошибка разыгрывания карты type: places number: 1',
        new Error('Для разыгрывания постоянок нужно вызывать playPermanent'),
      );

      restoreAllMocks();
    });

    describe('Нельзя разыгрывать разыгранное', () => {
      test('С played true', async () => {
        const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
        testHelper.giveCardToPlayer(card, activePlayer);
        card.played = true;

        const handlerMock = fn().mockResolvedValue(null);
        mock('../cardHandlers/creatures/1', () => ({
          default: handlerMock,
        }));

        const playCard = simplePlayCard({
          room,
          card,
          cardUsedByPlayer: true,
        });

        expect(card.playing).toBeFalsy();

        await playCard;

        expect(card.playing).toBeFalsy();
        expect(handlerMock).toHaveBeenCalledTimes(0);

        restoreAllMocks();
      });

      test('С playing true', async () => {
        const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
        testHelper.giveCardToPlayer(card, activePlayer);
        card.playing = true;

        const handlerMock = fn().mockResolvedValue(null);
        mock('../cardHandlers/creatures/1', () => ({
          default: handlerMock,
        }));

        const playCard = simplePlayCard({
          room,
          card,
          cardUsedByPlayer: true,
        });

        expect(card.playing).toBeTruthy();

        await playCard;

        expect(card.playing).toBeTruthy();
        expect(handlerMock).toHaveBeenCalledTimes(0);

        restoreAllMocks();
      });
    });

    test('Помечаем разыгранным, если нельзя вызвать хендлер', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.spells][12]);
      testHelper.giveCardToPlayer(card, activePlayer);

      const handlerMock = fn().mockResolvedValue(null);
      mock('../cardHandlers/spells/12', () => ({
        default: handlerMock,
      }));

      const playCard = simplePlayCard({
        room,
        card,
      });

      expect(card.playing).toBeFalsy();

      await playCard;

      expect(card.playing).toBeFalsy();
      expect(card.played).toBeTruthy();
      expect(handlerMock).toHaveBeenCalledTimes(0);

      restoreAllMocks();
    });
  });

  describe('playCardByLawlessness', () => {
    test('Разыгрывается карта', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
      testHelper.giveCardToPlayer(card, activePlayer);

      const handlerMock = fn().mockResolvedValue(null);
      mock('../cardHandlers/creatures/2', () => ({
        default: handlerMock,
      }));

      await playCardByLawlessness({
        room,
        card,
        target: activePlayer,
      });

      expect(card.played).toBeFalsy();
      expect(handlerMock).toHaveBeenCalledTimes(1);
      expect(handlerMock.mock.calls[0][0].room).toEqual(room);
      expect(handlerMock.mock.calls[0][0].card).toEqual(card);
      expect(handlerMock.mock.calls[0][0].target).toEqual(activePlayer);
      expect(handlerMock.mock.calls[0][0].player).toEqual(activePlayer);
      expect(handlerMock.mock.calls[0][0].cardUsedByPlayer).toBeFalsy();
      expect(handlerMock.mock.calls[0][0].canGuard).toBeTruthy();
      expect(handlerMock.mock.calls[0][0].byLawlessness).toBeTruthy();

      restoreAllMocks();
    });

    test('Нельзя разыгрывать без активного игрока', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
      testHelper.giveCardToPlayer(card, activePlayer);
      room.players = {};

      const handlerMock = fn().mockResolvedValue(null);
      mock('../cardHandlers/creatures/2', () => ({
        default: handlerMock,
      }));

      await playCardByLawlessness({
        room,
        card,
        target: activePlayer,
      });

      expect(handlerMock).toHaveBeenCalledTimes(0);

      restoreAllMocks();
    });

    test('Нельзя разыгрывать, если игра закончена', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
      testHelper.giveCardToPlayer(card, activePlayer);
      room.gameEnded = true;

      const handlerMock = fn().mockResolvedValue(null);
      mock('../cardHandlers/creatures/2', () => ({
        default: handlerMock,
      }));

      await playCardByLawlessness({
        room,
        card,
        target: activePlayer,
      });
      expect(handlerMock).toHaveBeenCalledTimes(0);

      restoreAllMocks();
    });

    test('Нельзя разыгрывать беспредел', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][2]);
      testHelper.giveCardToPlayer(card, activePlayer);

      const handlerMock = fn().mockResolvedValue(null);
      mock('../cardHandlers/lawlessnesses/2', () => ({
        default: handlerMock,
      }));

      await playCardByLawlessness({
        room,
        card,
        target: activePlayer,
      });

      expect(handlerMock).toHaveBeenCalledTimes(0);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Ошибка разыгрывания карты (от беспредела) type: lawlessnesses number: 2',
        new Error('Для разыгрывания беспредела нужно вызывать playLawlessness'),
      );

      restoreAllMocks();
    });

    test('Нельзя разыгрывать постоянку', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.places][2]);
      testHelper.giveCardToPlayer(card, activePlayer);

      const handlerMock = fn().mockResolvedValue(null);
      mock('../cardHandlers/places/2', () => ({
        default: handlerMock,
      }));

      await playCardByLawlessness({
        room,
        card,
        target: activePlayer,
      });

      expect(handlerMock).toHaveBeenCalledTimes(0);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Ошибка разыгрывания карты (от беспредела) type: places number: 2',
        new Error('Для разыгрывания постоянок нужно вызывать playPermanent'),
      );

      restoreAllMocks();
    });
  });

  describe('playPermanent', () => {
    test('Разыгрывается карта', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.places][1]);
      testHelper.giveCardToPlayer(card, activePlayer);

      const handlerMock = fn().mockResolvedValue(null);
      mock('../cardHandlers/places/1', () => ({
        default: handlerMock,
      }));

      const playCard = playPermanent({
        room,
        card,
        initPermanent: true,
      });

      expect(card.playing).toBeTruthy();

      await playCard;

      expect(card.playing).toBeFalsy();
      expect(handlerMock).toHaveBeenCalledTimes(1);
      expect(handlerMock.mock.calls[0][0].room).toEqual(room);
      expect(handlerMock.mock.calls[0][0].card).toEqual(card);
      expect(handlerMock.mock.calls[0][0].initPermanent).toBeTruthy();

      restoreAllMocks();
    });

    test('Нельзя разыгрывать без активного игрока', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.places][1]);
      testHelper.giveCardToPlayer(card, activePlayer);
      room.players = {};

      const handlerMock = fn().mockResolvedValue(null);
      mock('../cardHandlers/places/1', () => ({
        default: handlerMock,
      }));

      await playPermanent({
        room,
        card,
      });

      expect(handlerMock).toHaveBeenCalledTimes(0);

      restoreAllMocks();
    });

    test('Нельзя разыгрывать, если игра закончена', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.places][1]);
      testHelper.giveCardToPlayer(card, activePlayer);
      room.gameEnded = true;

      const handlerMock = fn().mockResolvedValue(null);
      mock('../cardHandlers/places/1', () => ({
        default: handlerMock,
      }));

      await playPermanent({
        room,
        card,
      });

      expect(handlerMock).toHaveBeenCalledTimes(0);

      restoreAllMocks();
    });

    test('Нельзя разыгрывать не постоянку', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      testHelper.giveCardToPlayer(card, activePlayer);

      const handlerMock = fn().mockResolvedValue(null);
      mock('../cardHandlers/creatures/1', () => ({
        default: handlerMock,
      }));

      await playPermanent({
        room,
        card,
      });

      expect(handlerMock).toHaveBeenCalledTimes(0);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Ошибка разыгрывания постоянки type: creatures number: 1',
        new Error('playPermanent используется только для разыгрывания постоянок'),
      );

      restoreAllMocks();
    });
  });

  describe('playLawlessness', () => {
    test('Разыгрывается карта', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][1]);

      const handlerMock = fn().mockResolvedValue(null);
      mock('../cardHandlers/lawlessnesses/1', () => ({
        default: handlerMock,
      }));

      await playLawlessness({ room, card });

      expect(card.playing).toBeFalsy();
      expect(handlerMock).toHaveBeenCalledTimes(1);
      expect(handlerMock.mock.calls[0][0].room).toEqual(room);
      expect(handlerMock.mock.calls[0][0].card).toEqual(card);

      restoreAllMocks();
    });

    test('Нельзя разыгрывать без активного игрока', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][1]);
      room.players = {};

      const handlerMock = fn().mockResolvedValue(null);
      mock('../cardHandlers/lawlessnesses/1', () => ({
        default: handlerMock,
      }));

      await playLawlessness({ room, card });

      expect(handlerMock).toHaveBeenCalledTimes(0);

      restoreAllMocks();
    });

    test('Нельзя разыгрывать, если игра закончена', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][1]);
      room.gameEnded = true;

      const handlerMock = fn().mockResolvedValue(null);
      mock('../cardHandlers/lawlessnesses/1', () => ({
        default: handlerMock,
      }));

      await playLawlessness({ room, card });

      expect(handlerMock).toHaveBeenCalledTimes(0);

      restoreAllMocks();
    });

    test('Нельзя разыгрывать не беспредел', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);

      const handlerMock = fn().mockResolvedValue(null);
      mock('../cardHandlers/creatures/1', () => ({
        default: handlerMock,
      }));

      await playLawlessness({ room, card });

      expect(handlerMock).toHaveBeenCalledTimes(0);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Ошибка разыгрывания беспредела type: creatures number: 1',
        new Error('playLawlessness используется только для разыгрывания беспределов'),
      );

      restoreAllMocks();
    });
  });

  describe('playGroupAttack', () => {
    test('Разыгрывается карта', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.legends][1]);
      testHelper.giveCardToPlayer(card, activePlayer);

      const playSpy = spyOn(playGroupAttackHandler, 'legendGroupAttack').mockImplementation(async () => {});

      await playGroupAttack({
        room,
        card,
        target: activePlayer,
        byLawlessness: true,
      });

      expect(playSpy).toHaveBeenCalledTimes(1);
      expect(playSpy.mock.calls[0][0].room).toEqual(room);
      expect(playSpy.mock.calls[0][0].card).toEqual(card);
      expect(playSpy.mock.calls[0][0].target).toEqual(activePlayer);
      expect(playSpy.mock.calls[0][0].byLawlessness).toBeTruthy();

      playSpy.mockRestore();
    });

    test('Нельзя разыгрывать без активного игрока', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.legends][1]);
      testHelper.giveCardToPlayer(card, activePlayer);
      room.players = {};

      const playSpy = spyOn(playGroupAttackHandler, 'legendGroupAttack').mockImplementation(async () => {});

      await playGroupAttack({ room, card });

      expect(playSpy).toHaveBeenCalledTimes(0);

      playSpy.mockRestore();
    });

    test('Нельзя разыгрывать, если игра закончена', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.legends][1]);
      testHelper.giveCardToPlayer(card, activePlayer);
      room.gameEnded = true;

      const playSpy = spyOn(playGroupAttackHandler, 'legendGroupAttack').mockImplementation(async () => {});

      await playGroupAttack({ room, card });

      expect(playSpy).toHaveBeenCalledTimes(0);

      playSpy.mockRestore();
    });

    test('Нельзя разыгрывать не легенду', async () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      testHelper.giveCardToPlayer(card, activePlayer);

      const playSpy = spyOn(playGroupAttackHandler, 'legendGroupAttack').mockImplementation(async () => {});

      await playGroupAttack({ room, card });

      expect(playSpy).toHaveBeenCalledTimes(0);

      playSpy.mockRestore();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Ошибка разыгрывания групповой атаки type: creatures number: 1',
        new Error('playGroupAttack используется только для разыгрывания групповых атак легенды'),
      );

      playSpy.mockRestore();
    });
  });
});
