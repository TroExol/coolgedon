import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('legends 3', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let legend3: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    legend3 = testHelper.createMockCard(room, cardMap[ECardTypes.legends][3]);
    testHelper.giveCardToPlayer(legend3, activePlayer);
  });

  test('Разыгрывается', async () => {
    activePlayer.discard = [testHelper.createMockCard(room, cardMap[ECardTypes.seeds][1])];
    activePlayer.hp = 10;

    await legend3.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend3.played).toBeTruthy();
    expect(activePlayer.hp).toBe(16);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Разыгрывается', async () => {
    activePlayer.hand = activePlayer.hand.filter(card => card.theSameType(ECardTypes.legends));

    await legend3.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend3.played).toBeTruthy();
    expect(activePlayer.hp).toBe(20);
    expect(activePlayer.totalPower).toBe(2);
  });
});
