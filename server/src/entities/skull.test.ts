import * as testHelper from 'Helpers/tests';
import * as playSkullEvent from 'Event/playSkull';
import { Skull } from 'Entity/skull';

import spyOn = jest.spyOn;

describe('Skull', () => {
  test('instance имеет дефолтные значения', () => {
    const room = testHelper.createMockRoom('1', 'player');
    const skull = new Skull({ id: 1, room });

    expect(skull.id).toBe(1);
    expect(skull.ownerNickname).toBeUndefined();
  });

  describe('format', () => {
    test('format возвращает корректные значения', () => {
      const room = testHelper.createMockRoom('1', 'player');
      const skull = testHelper.createMockSkull({ id: 1, room });

      expect(skull.format()).toEqual({ id: 1 });
    });
  });

  describe('play', () => {
    let playSkullSpy: jest.SpyInstance;

    beforeEach(() => {
      playSkullSpy = spyOn(playSkullEvent, 'playSkull').mockImplementation(async () => {});
    });

    afterEach(() => {
      playSkullSpy.mockRestore();
    });

    test('Игрок может разыграть жетон', async () => {
      const room = testHelper.createMockRoom('1', 'player');
      const player = testHelper.createMockPlayer({ room, nickname: 'player' });
      testHelper.addPlayerToRoom(room, player);
      const skull = testHelper.createMockSkull({ id: 1, room });
      skull.ownerNickname = 'player';

      spyOn(room, 'endGame');

      await skull.play();
      expect(playSkullEvent.playSkull).toHaveBeenCalledWith({ room, skull });
      expect(room.endGame).toHaveBeenCalledTimes(0);
    });

    test('Игрок может разыграть жетон с доп параметрами', async () => {
      const room = testHelper.createMockRoom('1', 'player');
      const player = testHelper.createMockPlayer({ room, nickname: 'player' });
      const player2 = testHelper.createMockPlayer({ room, nickname: 'player2' });
      testHelper.addPlayerToRoom(room, player);
      const skull = testHelper.createMockSkull({ id: 1, room });
      skull.ownerNickname = 'player';

      spyOn(room, 'endGame');

      await skull.play({ killer: player2 });
      expect(playSkullEvent.playSkull).toHaveBeenCalledWith({
        room,
        skull,
        killer: player2,
      });
      expect(room.endGame).toHaveBeenCalledTimes(0);
    });

    test('Игрок может разыграть жетон, после чего закончится игра, если жетонов больше нет', async () => {
      const room = testHelper.createMockRoom('1', 'player');
      room.skulls = [];
      const player = testHelper.createMockPlayer({ room, nickname: 'player' });
      testHelper.addPlayerToRoom(room, player);
      const skull = testHelper.createMockSkull({ id: 1, room });
      skull.ownerNickname = 'player';

      spyOn(room, 'endGame');

      await skull.play();
      expect(playSkullEvent.playSkull).toHaveBeenCalledWith({
        room,
        skull,
      });
      expect(room.endGame).toHaveBeenCalled();
    });

    test('Нельзя разыграть без владельца', async () => {
      const room = testHelper.createMockRoom('1', 'player');
      const skull = testHelper.createMockSkull({ id: 1, room });

      const consoleErrorSpy = testHelper.consoleErrorMockSpy();

      await skull.play();
      expect(console.error).toHaveBeenCalledWith('Невозможно разыграть жетон: нет владельца');
      expect(playSkullEvent.playSkull).toHaveBeenCalledTimes(0);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('get owner', () => {
    test('Возвращает владельца', () => {
      const room = testHelper.createMockRoom('1', 'player');
      const player = testHelper.createMockPlayer({ room, nickname: 'player' });
      testHelper.addPlayerToRoom(room, player);
      const skull = testHelper.createMockSkull({ id: 1, room });
      skull.ownerNickname = 'player';

      expect(skull.owner).toBe(player);
    });

    test('Не возвращает владельца, если его нет', () => {
      const room = testHelper.createMockRoom('1', 'player1');
      const skull = testHelper.createMockSkull({ id: 1, room });

      expect(skull.owner).toBeUndefined();
    });
  });

  describe('theSame', () => {
    test('Корректно сравнивает жетоны', () => {
      const room = testHelper.createMockRoom('1', 'player');
      const skull1 = testHelper.createMockSkull({ id: 1, room });
      const skull2 = testHelper.createMockSkull({ id: 2, room });

      expect(skull1.theSame(skull1)).toBeTruthy();
      expect(skull1.theSame(skull2)).toBeFalsy();
    });
  });
});
