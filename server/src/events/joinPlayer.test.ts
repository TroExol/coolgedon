/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';
import { joinPlayer } from 'Event/joinPlayer';
import { rooms } from 'Entity/room';

import spyOn = jest.spyOn;

describe('joinPlayer', () => {
  let room: Room;
  let activePlayer: Player;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    rooms[room.name] = room;
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
    testHelper.addPlayerToRoom(room, activePlayer);
    consoleErrorSpy = testHelper.consoleErrorMockSpy();

    spyOn(room, 'logEvent');
    spyOn(room, 'sendInfo');
  });

  afterEach(() => {
    delete rooms[room.name];
    consoleErrorSpy?.mockRestore();
  });

  test('Подключается игрок', async () => {
    room.familiars = room.familiars.slice(-2);
    room.props = room.props.slice(-2);
    const topFamiliar = getLastElement(room.familiars)!;
    const topProp = getLastElement(room.props)!;
    spyOn(room, 'emitWithAck').mockImplementation(async () => ({ prop: topProp.format(), familiar: topFamiliar.format() }));
    const countFamiliars = room.familiars.length;
    const countProps = room.props.length;

    await joinPlayer({ room, nickname: 'otherPlayer' });

    expect(room.players.otherPlayer.nickname).toEqual('otherPlayer');
    expect(room.players.otherPlayer.familiarToBuy).toEqual(topFamiliar);
    expect(room.players.otherPlayer.props.indexOf(topProp)).not.toBe(-1);
    expect(room.familiars.length).toEqual(countFamiliars - 1);
    expect(room.props.length).toEqual(countProps - 1);
    expect(room.activePlayer).toEqual(activePlayer);
    expect(room.sendInfo).toHaveBeenCalledTimes(1);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок otherPlayer подключился');
  });

  test('Не подключается игрок дважды при быстром нажатии кнопки', async () => {
    room.familiars = room.familiars.slice(-2);
    room.props = room.props.slice(-2);
    const topFamiliar = getLastElement(room.familiars)!;
    const topProp = getLastElement(room.props)!;
    spyOn(room, 'emitWithAck').mockImplementation(async () => ({ prop: topProp.format(), familiar: topFamiliar.format() }));
    const countFamiliars = room.familiars.length;
    const countProps = room.props.length;

    await Promise.allSettled([
      joinPlayer({ room, nickname: 'otherPlayer' }),
      joinPlayer({ room, nickname: 'otherPlayer' }),
    ]);

    expect(room.players.otherPlayer.nickname).toEqual('otherPlayer');
    expect(room.players.otherPlayer.familiarToBuy).toEqual(topFamiliar);
    expect(room.players.otherPlayer.props.indexOf(topProp)).not.toBe(-1);
    expect(room.playersArray.length).toBe(2);
    expect(room.familiars.length).toEqual(countFamiliars - 1);
    expect(room.props.length).toEqual(countProps - 1);
    expect(room.activePlayer).toEqual(activePlayer);
    expect(room.sendInfo).toHaveBeenCalledTimes(1);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок otherPlayer подключился');
  });

  test('Подключается существующий игрок', async () => {
    spyOn(room, 'emitWithAck').mockImplementation((async () => {}) as any);
    const countFamiliars = room.familiars.length;
    const countProps = room.props.length;

    await joinPlayer({ room, nickname: 'activePlayer' });

    expect(room.players.activePlayer).toEqual(activePlayer);
    expect(room.familiars.length).toEqual(countFamiliars);
    expect(room.props.length).toEqual(countProps);
    expect(room.activePlayer).toEqual(activePlayer);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.emitWithAck).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer подключился');
  });
});
