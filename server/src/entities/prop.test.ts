import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import * as playPropEvent from 'Event/playProp';
import { Prop } from 'Entity/prop';

import spyOn = jest.spyOn;

describe('Prop', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = testHelper.consoleErrorMockSpy();
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
  });

  test('instance имеет дефолтные значения', () => {
    const room = testHelper.createMockRoom('1', 'player');
    const prop = new Prop({ id: 1, playable: false, room });

    expect(prop.id).toBe(1);
    expect(prop.playable).toBeFalsy();
    expect(prop.played).toBeFalsy();
    expect(prop.temp).toBeFalsy();
    expect(prop.ownerNickname).toBeUndefined();
  });

  describe('format', () => {
    test('format возвращает корректные значения при playable false', () => {
      const room = testHelper.createMockRoom('1', 'player');
      const prop = testHelper.createMockProp({ id: 1, playable: false, room });

      expect(prop.format()).toEqual({
        id: 1,
        canPlay: false,
      });
      prop.played = true;
      expect(prop.format()).toEqual({
        id: 1,
        canPlay: false,
      });
    });

    test('format возвращает корректные значения при playable true', () => {
      const room = testHelper.createMockRoom('1', 'player');
      const prop = testHelper.createMockProp({ id: 1, playable: true, room });

      expect(prop.format()).toEqual({
        id: 1,
        canPlay: true,
      });
      prop.played = true;
      expect(prop.format()).toEqual({
        id: 1,
        canPlay: false,
      });
    });
  });

  describe('markAsPlayed', () => {
    test('Пометить свойство разыгранным', () => {
      const room = testHelper.createMockRoom('1', 'player');
      const player = testHelper.createMockPlayer({ room, nickname: 'player' });
      const prop = testHelper.createMockProp({ id: 1, playable: false, room });
      testHelper.addPlayerToRoom(room, player);
      prop.ownerNickname = 'player';

      spyOn(room, 'sendInfo');
      spyOn(room, 'logEvent');

      prop.markAsPlayed();
      expect(prop.played).toBeTruthy();
      expect(room.sendInfo).toHaveBeenCalled();
      expect(room.logEvent).toHaveBeenCalledWith('Игрок player разыграл свойство');
    });

    test('Нельзя пометить свойство разыгранным без owner', () => {
      const room = testHelper.createMockRoom('1', 'player');
      const prop = testHelper.createMockProp({ id: 1, playable: false, room });

      prop.markAsPlayed();
      expect(prop.played).toBeFalsy();
      expect(console.error).toHaveBeenCalledWith('Невозможно пометить свойство разыгранным: нет владельца');
    });

    test('Нельзя пометить свойство разыгранным для owner != активного игрока', () => {
      const room = testHelper.createMockRoom('1', 'player1');
      const player1 = testHelper.createMockPlayer({ room, nickname: 'player1' });
      const player2 = testHelper.createMockPlayer({ room, nickname: 'player2' });
      testHelper.addPlayerToRoom(room, player1);
      testHelper.addPlayerToRoom(room, player2);
      const prop = testHelper.createMockProp({ id: 1, playable: false, room });
      prop.ownerNickname = 'player2';

      prop.markAsPlayed();
      expect(console.error).toHaveBeenCalledWith('Невозможно пометить свойство разыгранным: владелец не активный игрок');
      expect(prop.played).toBeFalsy();
    });
  });

  describe('play', () => {
    let playPropSpy: jest.SpyInstance;

    beforeEach(() => {
      playPropSpy = spyOn(playPropEvent, 'playProp');
    });

    afterEach(() => {
      playPropSpy.mockRestore();
    });

    test('Игрок может разыграть свойство', () => {
      const room = testHelper.createMockRoom('1', 'player');
      const player = testHelper.createMockPlayer({ room, nickname: 'player' });
      testHelper.addPlayerToRoom(room, player);
      const prop = testHelper.createMockProp({ id: 1, playable: false, room });
      prop.ownerNickname = 'player';

      prop.play();
      expect(playPropEvent.playProp).toHaveBeenCalledWith({
        room,
        prop,
      });
    });

    test('Игрок может разыграть свойство с доп параметрами', () => {
      const room = testHelper.createMockRoom('1', 'player');
      const player = testHelper.createMockPlayer({ room, nickname: 'player' });
      testHelper.addPlayerToRoom(room, player);
      const prop = testHelper.createMockProp({ id: 1, playable: false, room });
      prop.ownerNickname = 'player';
      const card = {} as Card;

      prop.play({ card });
      expect(playPropEvent.playProp).toHaveBeenCalledWith({
        room,
        prop,
        card,
      });
    });

    test('Нельзя разыграть без владельца', () => {
      const room = testHelper.createMockRoom('1', 'player');
      const prop = testHelper.createMockProp({ id: 1, playable: false, room });

      prop.play();
      expect(console.error).toHaveBeenCalledWith('Невозможно разыграть свойство: нет владельца');
      expect(playPropEvent.playProp).toHaveBeenCalledTimes(0);
    });

    test('Нельзя разыграть для owner != активного игрока', () => {
      const room = testHelper.createMockRoom('1', 'player1');
      const player1 = testHelper.createMockPlayer({ room, nickname: 'player1' });
      const player2 = testHelper.createMockPlayer({ room, nickname: 'player2' });
      testHelper.addPlayerToRoom(room, player1);
      testHelper.addPlayerToRoom(room, player2);
      const prop = testHelper.createMockProp({ id: 1, playable: false, room });
      prop.ownerNickname = 'player2';

      prop.play();
      expect(console.error).toHaveBeenCalledWith('Невозможно разыграть свойство: владелец не активный игрок');
      expect(playPropEvent.playProp).toHaveBeenCalledTimes(0);
    });
  });

  describe('get owner', () => {
    test('Возвращает владельца', () => {
      const room = testHelper.createMockRoom('1', 'player');
      const player = testHelper.createMockPlayer({ room, nickname: 'player' });
      testHelper.addPlayerToRoom(room, player);
      const prop = testHelper.createMockProp({ id: 1, playable: false, room });
      prop.ownerNickname = 'player';

      expect(prop.owner).toBe(player);
    });

    test('Не возвращает владельца, если его нет', () => {
      const room = testHelper.createMockRoom('1', 'player1');
      const prop = testHelper.createMockProp({ id: 1, playable: false, room });

      expect(prop.owner).toBeUndefined();
    });
  });
});
