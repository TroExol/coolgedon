import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';

describe('legends 8', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let legend8: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    legend8 = testHelper.createMockCard(room, cardMap[ECardTypes.legends][8]);
    testHelper.giveCardToPlayer(legend8, activePlayer);
  });

  test('Берет карту', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    room.deck.push(card);

    await legend8.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend8.played).toBeTruthy();
    expect(getLastElement(activePlayer.deck)).toEqual(card);
    expect(room.deck.includes(card)).toBeFalsy();
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Добавляется мощь', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][1]);
    room.deck.push(card);

    await legend8.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend8.played).toBeTruthy();
    expect(activePlayer.deck.includes(card)).toBeFalsy();
    expect(room.deck.includes(card)).toBeFalsy();
    expect(room.removed.lawlessnesses.includes(card)).toBeTruthy();
    expect(activePlayer.totalPower).toBe(3);
  });
});
