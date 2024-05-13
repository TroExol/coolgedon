import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('lawlessnesses 19', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let lawlessness19: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    lawlessness19 = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][19]);
  });

  test('Разыгрывается', async () => {
    activePlayer.hp = 15;

    spyOn(room, 'sendInfo').mockImplementation(fn());
    spyOn(room, 'logEvent').mockImplementation(fn());

    await lawlessness19.play({ type: 'lawlessness' });

    expect(lawlessness19.played).toBeFalsy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(15);
    expect(activePlayer.totalPower).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(1);
    expect(room.logEvent).toHaveBeenLastCalledWith('Игрок activePlayer обменялся здоровьем с игроком otherPlayer');
  });

  test('Не меняются хп, если одинаковое', async () => {
    spyOn(room, 'sendInfo').mockImplementation(fn());
    spyOn(room, 'logEvent').mockImplementation(fn());

    await lawlessness19.play({ type: 'lawlessness' });

    expect(lawlessness19.played).toBeFalsy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(20);
    expect(activePlayer.totalPower).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
  });
});
