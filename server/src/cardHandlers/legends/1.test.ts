import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('legends 1', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let legend1: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    legend1 = testHelper.createMockCard(room, cardMap[ECardTypes.legends][1]);
    testHelper.giveCardToPlayer(legend1, activePlayer);
  });

  test('Разыгрывается', async () => {
    await legend1.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend1.played).toBeTruthy();
    expect(activePlayer.deck.length).toBe(4);
    expect(activePlayer.hand.length).toBe(7);
    expect(otherPlayer.hp).toBe(19);
    expect(activePlayer.totalPower).toBe(1);
  });
});
