import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;

describe('legends 4', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let legend4: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    legend4 = testHelper.createMockCard(room, cardMap[ECardTypes.legends][4]);
    testHelper.giveCardToPlayer(legend4, activePlayer);
  });

  test('Разыгрывается', async () => {
    spyOn(activePlayer, 'selectTarget').mockResolvedValue(otherPlayer);

    await legend4.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend4.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(16);
    expect(activePlayer.totalPower).toBe(4);
  });

  test('Защитился', async () => {
    spyOn(activePlayer, 'selectTarget').mockResolvedValue(otherPlayer);
    spyOn(otherPlayer, 'guard').mockResolvedValue(false);

    await legend4.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend4.played).toBeTruthy();
    expect(otherPlayer.hp).toBe(20);
    expect(activePlayer.totalPower).toBe(4);
  });

  test('Не разыгрывается, если не выбран враг', async () => {
    spyOn(activePlayer, 'selectTarget').mockResolvedValue(undefined);

    await legend4.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend4.played).toBeFalsy();
    expect(otherPlayer.hp).toBe(20);
    expect(activePlayer.totalPower).toBe(0);
  });
});
