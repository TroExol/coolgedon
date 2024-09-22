import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';

import * as testHelper from 'Helpers/tests';
import { buyCrazyMagicCard } from 'Event/buyCrazyMagicCard';

import spyOn = jest.spyOn;

describe('buyCrazyMagicCard', () => {
  let room: Room;
  let activePlayer: Player;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
    testHelper.addPlayerToRoom(room, activePlayer);

    spyOn(room, 'logEvent');
    spyOn(room, 'sendInfo');
  });

  test('Приобретается шальная магия', () => {
    room.onCurrentTurn.additionalPower = 3;
    buyCrazyMagicCard(room);
    expect(room.onCurrentTurn.additionalPower).toBe(3);
    expect(room.crazyMagic.length).toBe(15);
    expect(room.onCurrentTurn.powerWasted).toBe(3);
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard.slice(-1)[0].type).toBe(ECardTypes.crazyMagic);
    // + 1 в takeCardsTo
    expect(room.sendInfo).toHaveBeenCalledTimes(2);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer купил карту шальную магию');
  });

  test('Не приобретается шальная магия дважды при быстром нажатии кнопки', () => {
    room.onCurrentTurn.additionalPower = 3;
    buyCrazyMagicCard(room);
    buyCrazyMagicCard(room);
    expect(room.onCurrentTurn.additionalPower).toBe(3);
    expect(room.crazyMagic.length).toBe(15);
    expect(room.onCurrentTurn.powerWasted).toBe(3);
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard.slice(-1)[0].type).toBe(ECardTypes.crazyMagic);
    // + 1 в takeCardsTo
    expect(room.sendInfo).toHaveBeenCalledTimes(2);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer купил карту шальную магию');
  });

  test('Нельзя купить, если не хватает силы', () => {
    room.onCurrentTurn.additionalPower = 2;
    buyCrazyMagicCard(room);
    expect(room.onCurrentTurn.additionalPower).toBe(2);
    expect(room.crazyMagic.length).toBe(16);
    expect(room.onCurrentTurn.powerWasted).toBe(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
  });

  test('Нельзя купить, если нет активного игрока', () => {
    room.onCurrentTurn.additionalPower = 3;
    room.players = {};
    buyCrazyMagicCard(room);
    expect(room.onCurrentTurn.additionalPower).toBe(3);
    expect(room.crazyMagic.length).toBe(16);
    expect(room.onCurrentTurn.powerWasted).toBe(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
  });

  test('Нельзя купить, если игра закончилась', () => {
    room.onCurrentTurn.additionalPower = 3;
    room.gameEnded = true;
    buyCrazyMagicCard(room);
    expect(room.onCurrentTurn.additionalPower).toBe(3);
    expect(room.crazyMagic.length).toBe(16);
    expect(room.onCurrentTurn.powerWasted).toBe(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
  });

  test('Нельзя купить, если карт нет', () => {
    room.onCurrentTurn.additionalPower = 3;
    room.crazyMagic = [];
    buyCrazyMagicCard(room);
    expect(room.onCurrentTurn.additionalPower).toBe(3);
    expect(room.crazyMagic.length).toBe(0);
    expect(room.onCurrentTurn.powerWasted).toBe(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
  });
});
