import { cardMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';

import * as testHelper from 'Helpers/tests';
import { playGuard } from 'Event/playGuard';

import restoreAllMocks = jest.restoreAllMocks;
import mock = jest.mock;
import fn = jest.fn;

describe('playGuard', () => {
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

  test('Разыгрывается защита из руки', async () => {
    const cardAttack = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][7]);
    testHelper.giveCardToPlayer(card, otherPlayer);

    const handlerMock = fn().mockResolvedValue(null);
    mock('../guardHandlers/creatures/7', () => ({
      default: handlerMock,
    }));

    await playGuard({
      room,
      card,
      cardAttack,
      target: otherPlayer,
      attacker: activePlayer,
    });

    expect(handlerMock).toHaveBeenCalledTimes(1);
    expect(otherPlayer.hand.indexOf(card)).toBe(-1);
    expect(otherPlayer.discard.indexOf(card)).not.toBe(-1);
    expect(handlerMock.mock.calls[0][0].room).toEqual(room);
    expect(handlerMock.mock.calls[0][0].card).toEqual(card);
    expect(handlerMock.mock.calls[0][0].target).toEqual(otherPlayer);
    expect(handlerMock.mock.calls[0][0].attacker).toEqual(activePlayer);
    expect(handlerMock.mock.calls[0][0].damage).toBeUndefined();

    restoreAllMocks();
  });

  test('Разыгрывается защита из постоянок', async () => {
    const cardAttack = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][2]);
    card.ownerNickname = 'otherPlayer';
    otherPlayer.activePermanent.push(card);

    const handlerMock = fn().mockResolvedValue(null);
    mock('../guardHandlers/treasures/2', () => ({
      default: handlerMock,
    }));

    await playGuard({
      room,
      card,
      cardAttack,
      target: otherPlayer,
      attacker: activePlayer,
    });

    expect(handlerMock).toHaveBeenCalledTimes(1);
    expect(otherPlayer.activePermanent.indexOf(card)).toBe(-1);
    expect(otherPlayer.discard.indexOf(card)).not.toBe(-1);
    expect(handlerMock.mock.calls[0][0].room).toEqual(room);
    expect(handlerMock.mock.calls[0][0].card).toEqual(card);
    expect(handlerMock.mock.calls[0][0].target).toEqual(otherPlayer);
    expect(handlerMock.mock.calls[0][0].attacker).toEqual(activePlayer);
    expect(handlerMock.mock.calls[0][0].damage).toBeUndefined();

    restoreAllMocks();
  });

  test('Нельзя разыгрывать без активного игрока', async () => {
    const cardAttack = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][7]);
    testHelper.giveCardToPlayer(card, otherPlayer);
    room.players = {};

    const handlerMock = fn().mockResolvedValue(null);
    mock('../guardHandlers/creatures/7', () => ({
      default: handlerMock,
    }));

    await playGuard({
      room,
      card,
      cardAttack,
      target: otherPlayer,
    });

    expect(handlerMock).toHaveBeenCalledTimes(0);
    expect(otherPlayer.hand.indexOf(card)).not.toBe(-1);
    expect(otherPlayer.discard.indexOf(card)).toBe(-1);

    restoreAllMocks();
  });

  test('Нельзя разыгрывать, если игра закончена', async () => {
    const cardAttack = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][7]);
    testHelper.giveCardToPlayer(card, otherPlayer);
    room.gameEnded = true;

    const handlerMock = fn().mockResolvedValue(null);
    mock('../guardHandlers/creatures/7', () => ({
      default: handlerMock,
    }));

    await playGuard({
      room,
      card,
      cardAttack,
      target: otherPlayer,
    });

    expect(handlerMock).toHaveBeenCalledTimes(0);
    expect(otherPlayer.hand.indexOf(card)).not.toBe(-1);
    expect(otherPlayer.discard.indexOf(card)).toBe(-1);

    restoreAllMocks();
  });
});
