import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('wizards 4', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let wizard4: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    wizard4 = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][4]);
    testHelper.giveCardToPlayer(wizard4, activePlayer);
  });

  test('Разыгрывается', async () => {
    await wizard4.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard4.played).toBeTruthy();
    expect(activePlayer.hp).toBe(22);
    expect(activePlayer.hand.length).toBe(7);
    expect(activePlayer.totalPower).toBe(0);
  });
});
