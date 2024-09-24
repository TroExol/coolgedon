import { cardMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import * as playPropEvent from 'Event/playProp';
import { Prop } from 'Entity/prop';

import spyOn = jest.spyOn;

describe('Prop', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;

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

  test('instance имеет дефолтные значения', () => {
    const prop = new Prop({ id: 1, playable: false, room });

    expect(prop.id).toBe(1);
    expect(prop.playable).toBeFalsy();
    expect(prop.played).toBeFalsy();
    expect(prop.temp).toBeFalsy();
    expect(prop.ownerNickname).toBeUndefined();
  });

  describe('format', () => {
    test('format возвращает корректные значения при playable false', () => {
      const prop = testHelper.createMockProp({ id: 5, playable: false, room });

      expect(prop.format()).toEqual({
        id: 5,
        canPlay: false,
      });
      prop.played = true;
      expect(prop.format()).toEqual({
        id: 5,
        canPlay: false,
      });
    });

    test('format возвращает корректные значения при playable true', () => {
      const prop = testHelper.createMockProp({ id: 5, playable: true, room });

      expect(prop.format()).toEqual({
        id: 5,
        canPlay: true,
      });
      prop.played = true;
      expect(prop.format()).toEqual({
        id: 5,
        canPlay: false,
      });
    });
  });

  describe('canPlay', () => {
    test('prop 1', () => {
      const prop = testHelper.createMockProp({ id: 1, playable: false, room });
      prop.ownerNickname = activePlayer.nickname;

      expect(prop.canPlay()).toBeFalsy();

      activePlayer.discard = [...activePlayer.deck];
      activePlayer.deck = [];

      expect(prop.canPlay()).toBeTruthy();
    });

    test('prop 2', () => {
      const prop = testHelper.createMockProp({ id: 2, playable: false, room });
      prop.ownerNickname = activePlayer.nickname;

      expect(prop.canPlay()).toBeTruthy();
    });

    test('prop 3', () => {
      const prop = testHelper.createMockProp({ id: 3, playable: false, room });
      prop.ownerNickname = activePlayer.nickname;

      expect(prop.canPlay()).toBeFalsy();

      const wizard = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][1]);
      room.onCurrentTurn.boughtOrReceivedCards[ECardTypes.wizards] = [wizard];

      expect(prop.canPlay()).toBeTruthy();
    });

    test('prop 4', () => {
      const prop = testHelper.createMockProp({ id: 4, playable: true, room });
      prop.ownerNickname = activePlayer.nickname;

      expect(prop.canPlay()).toBeTruthy();

      activePlayer.hp = 3;

      expect(prop.canPlay()).toBeFalsy();
    });

    test('prop 5', () => {
      const prop = testHelper.createMockProp({ id: 5, playable: false, room });
      prop.ownerNickname = activePlayer.nickname;

      expect(prop.canPlay()).toBeTruthy();
    });

    test('prop 6', () => {
      const prop = testHelper.createMockProp({ id: 6, playable: false, room });
      prop.ownerNickname = activePlayer.nickname;

      expect(prop.canPlay()).toBeTruthy();
    });

    test('prop 7', () => {
      const prop = testHelper.createMockProp({ id: 7, playable: false, room });
      prop.ownerNickname = activePlayer.nickname;

      expect(prop.canPlay()).toBeTruthy();
    });

    test('prop 8', () => {
      const prop = testHelper.createMockProp({ id: 8, playable: false, room });
      prop.ownerNickname = activePlayer.nickname;

      expect(prop.canPlay()).toBeTruthy();
    });
  });

  describe('markAsPlayed', () => {
    test('Пометить свойство разыгранным', () => {
      const player = testHelper.createMockPlayer({ room, nickname: 'player' });
      const prop = testHelper.createMockProp({ id: 1, playable: false, room });
      testHelper.addPlayerToRoom(room, player);
      prop.ownerNickname = activePlayer.nickname;

      spyOn(room, 'sendInfo');
      spyOn(room, 'logEvent');

      prop.markAsPlayed();
      expect(prop.played).toBeTruthy();
      expect(room.sendInfo).toHaveBeenCalled();
      expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer разыграл свойство');
    });

    test('Нельзя пометить свойство разыгранным без owner', () => {
      const prop = testHelper.createMockProp({ id: 1, playable: false, room });

      prop.markAsPlayed();
      expect(prop.played).toBeFalsy();
      expect(console.error).toHaveBeenCalledWith('Невозможно пометить свойство разыгранным: нет владельца');
    });

    test('Нельзя пометить свойство разыгранным для owner != активного игрока', () => {
      const prop = testHelper.createMockProp({ id: 1, playable: false, room });
      prop.ownerNickname = otherPlayer.nickname;

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
      const prop = testHelper.createMockProp({ id: 1, playable: false, room });
      prop.ownerNickname = activePlayer.nickname;

      prop.play();
      expect(playPropEvent.playProp).toHaveBeenCalledWith({
        room,
        prop,
      });
    });

    test('Игрок может разыграть свойство с доп параметрами', () => {
      const prop = testHelper.createMockProp({ id: 1, playable: false, room });
      prop.ownerNickname = activePlayer.nickname;
      const card = {} as Card;

      prop.play({ card });
      expect(playPropEvent.playProp).toHaveBeenCalledWith({
        room,
        prop,
        card,
      });
    });

    test('Нельзя разыграть без владельца', () => {
      const prop = testHelper.createMockProp({ id: 1, playable: false, room });

      prop.play();
      expect(console.error).toHaveBeenCalledWith('Невозможно разыграть свойство: нет владельца');
      expect(playPropEvent.playProp).toHaveBeenCalledTimes(0);
    });

    test('Нельзя разыграть для owner != активного игрока', () => {
      const prop = testHelper.createMockProp({ id: 1, playable: false, room });
      prop.ownerNickname = otherPlayer.nickname;

      prop.play();
      expect(console.error).toHaveBeenCalledWith('Невозможно разыграть свойство: владелец не активный игрок');
      expect(playPropEvent.playProp).toHaveBeenCalledTimes(0);
    });
  });

  describe('get owner', () => {
    test('Возвращает владельца', () => {
      const prop = testHelper.createMockProp({ id: 1, playable: false, room });
      prop.ownerNickname = activePlayer.nickname;

      expect(prop.owner).toBe(activePlayer);
    });

    test('Не возвращает владельца, если его нет', () => {
      const prop = testHelper.createMockProp({ id: 1, playable: false, room });

      expect(prop.owner).toBeUndefined();
    });
  });
});
