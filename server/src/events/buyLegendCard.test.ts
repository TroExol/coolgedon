import { propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';

import * as testHelper from 'Helpers/tests';
import { buyLegendCard } from 'Event/buyLegendCard';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('buyLegendCard', () => {
  let room: Room;
  let activePlayer: Player;
  let countInitialLegends: number;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    countInitialLegends = room.legends.length;
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
    testHelper.addPlayerToRoom(room, activePlayer);

    spyOn(room, 'logEvent');
    spyOn(room, 'sendInfo');
  });

  test('Приобретается легенда', () => {
    room.onCurrentTurn.additionalPower = 8;
    buyLegendCard(room);
    expect(room.onCurrentTurn.additionalPower).toBe(8);
    expect(room.legends.length).toBe(countInitialLegends - 1);
    expect(room.onCurrentTurn.powerWasted).toBe(8);
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard.slice(-1)[0].type).toBe(ECardTypes.legends);
    // + 1 в takeCardsTo
    expect(room.sendInfo).toHaveBeenCalledTimes(2);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer купил легенду');
  });

  test('Возвращаются временные свойства при покупке', () => {
    const countInitialPropsInRoom = room.props.length;
    const prop = testHelper.createMockProp(propMap[1]);
    prop.temp = true;
    prop.ownerNickname = activePlayer.nickname;
    activePlayer.props = [prop];
    room.onCurrentTurn.additionalPower = 8;
    expect(activePlayer.props.length).toBe(1);

    buyLegendCard(room);

    expect(room.props.length).toBe(countInitialPropsInRoom + 1);
    expect(prop.temp).toBeFalsy();
    expect(prop.ownerNickname).toBeUndefined();
    expect(activePlayer.props.length).toBe(0);
    expect(activePlayer.props.indexOf(prop)).toBe(-1);
    expect(room.props.includes(prop)).toBeTruthy();
    expect(room.onCurrentTurn.additionalPower).toBe(8);
    expect(room.legends.length).toBe(countInitialLegends - 1);
    expect(room.onCurrentTurn.powerWasted).toBe(8);
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard.slice(-1)[0].type).toBe(ECardTypes.legends);
    // + 1 в takeCardsTo
    expect(room.sendInfo).toHaveBeenCalledTimes(2);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer купил легенду');
  });

  test('Заканчивается игра, если куплена последняя легенда', () => {
    room.legends = room.legends.slice(-1);
    room.onCurrentTurn.additionalPower = 8;

    spyOn(room, 'endGame').mockImplementation(fn());

    buyLegendCard(room);

    expect(room.onCurrentTurn.additionalPower).toBe(8);
    expect(room.legends.length).toBe(0);
    expect(room.onCurrentTurn.powerWasted).toBe(8);
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard.slice(-1)[0].type).toBe(ECardTypes.legends);
    // + 1 в takeCardsTo
    expect(room.sendInfo).toHaveBeenCalledTimes(2);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer купил легенду');
    expect(room.endGame).toHaveBeenCalledTimes(1);
  });

  test('Нельзя купить, если не хватает силы', () => {
    room.onCurrentTurn.additionalPower = 2;
    buyLegendCard(room);
    expect(room.onCurrentTurn.additionalPower).toBe(2);
    expect(room.legends.length).toBe(countInitialLegends);
    expect(room.onCurrentTurn.powerWasted).toBe(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
  });

  test('Нельзя купить, если нет активного игрока', () => {
    room.onCurrentTurn.additionalPower = 8;
    room.players = {};
    buyLegendCard(room);
    expect(room.onCurrentTurn.additionalPower).toBe(8);
    expect(room.legends.length).toBe(countInitialLegends);
    expect(room.onCurrentTurn.powerWasted).toBe(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
  });

  test('Нельзя купить, если игра закончилась', () => {
    room.onCurrentTurn.additionalPower = 8;
    room.gameEnded = true;
    buyLegendCard(room);
    expect(room.onCurrentTurn.additionalPower).toBe(8);
    expect(room.legends.length).toBe(countInitialLegends);
    expect(room.onCurrentTurn.powerWasted).toBe(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
  });

  test('Нельзя купить, если карт нет', () => {
    room.onCurrentTurn.additionalPower = 8;
    room.legends = [];
    buyLegendCard(room);
    expect(room.onCurrentTurn.additionalPower).toBe(8);
    expect(room.legends.length).toBe(0);
    expect(room.onCurrentTurn.powerWasted).toBe(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
  });
});
