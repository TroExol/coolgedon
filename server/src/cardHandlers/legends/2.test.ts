import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;

describe('legends 2', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let legend2: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    legend2 = testHelper.createMockCard(room, cardMap[ECardTypes.legends][2]);
    testHelper.giveCardToPlayer(legend2, activePlayer);
  });

  test('Разыгрывается', async () => {
    spyOn(activePlayer, 'selectTarget').mockResolvedValue(otherPlayer);

    await legend2.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend2.played).toBeTruthy();
    expect(otherPlayer.discard.length).toBe(1);
    expect(otherPlayer.discard[0].type).toBe(ECardTypes.sluggishStick);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не разыгрывается, если не выбран враг', async () => {
    spyOn(activePlayer, 'selectTarget').mockResolvedValue(undefined);

    await legend2.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend2.played).toBeFalsy();
    expect(otherPlayer.discard.length).toBe(0);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Не разыгрывается, если нет палок', async () => {
    room.sluggishStick = [];

    await legend2.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend2.played).toBeTruthy();
    expect(otherPlayer.discard.length).toBe(0);
    expect(activePlayer.totalPower).toBe(2);
  });
});
