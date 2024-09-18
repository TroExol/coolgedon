import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('lawlessnesses 10', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let otherPlayer2: Player;
  let lawlessness10: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 }); // Левый враг
    otherPlayer2 = testHelper.createMockPlayer({ room, nickname: 'otherPlayer2', prop: prop4 }); // Правый враг
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    testHelper.addPlayerToRoom(room, otherPlayer2);
    lawlessness10 = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][10]);
  });

  test('Разыгрывается', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    testHelper.giveCardToPlayer(card, activePlayer);

    await lawlessness10.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness10.played).toBeFalsy();
    expect(activePlayer.hand.length).toBe(6);
    expect(otherPlayer.hand.length).toBe(7);
    expect(otherPlayer2.hand.length).toBe(7);
    expect(activePlayer.totalPower).toBe(0);
  });
});
