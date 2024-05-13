import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';
import { playTower } from 'Event/playTower';

import spyOn = jest.spyOn;
import fn = jest.fn;

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

    await playTower({ room, player: activePlayer });

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

    await playTower({ room, player: activePlayer });

    expect(activePlayer.selectCards).toHaveBeenCalledTimes(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.deck.length).toBe(5);
    expect(activePlayer.hand.length).toBe(5);
  });

  test('Не разыгрывается, если у игрока нет башни', async () => {
    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

    await playTower({ room, player: activePlayer });

    expect(activePlayer.selectCards).toHaveBeenCalledTimes(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.deck.length).toBe(5);
    expect(activePlayer.hand.length).toBe(5);
  });

  test('Не разыгрывается, если у игрока нет сброса и колоды', async () => {
    activePlayer.hasTower = true;
    activePlayer.deck = [];

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

    await playTower({ room, player: activePlayer });

    expect(activePlayer.selectCards).toHaveBeenCalledTimes(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.deck.length).toBe(0);
    expect(activePlayer.hand.length).toBe(5);
  });
});
