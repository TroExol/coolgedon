import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('familiars 1', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let familiar1: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    familiar1 = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][1]);
    testHelper.giveCardToPlayer(familiar1, activePlayer);
  });

  test('Разыгрывается', async () => {
    activePlayer.hp = 10;
    await familiar1.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(familiar1.played).toBeTruthy();
    expect(activePlayer.hp).toBe(16);
    expect(activePlayer.totalPower).toBe(2);
  });
});
