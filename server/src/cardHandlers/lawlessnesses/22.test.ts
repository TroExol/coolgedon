import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('lawlessnesses 22', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let lawlessness22: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    lawlessness22 = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][22]);
  });

  test('Разыгрывается', async () => {
    activePlayer.discard = [...activePlayer.deck];
    activePlayer.discard.push(...activePlayer.hand.splice(-2));
    activePlayer.deck = [];

    await lawlessness22.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness22.played).toBeFalsy();
    expect(activePlayer.deck.length).toBe(5);
    expect(otherPlayer.deck.length).toBe(5);
    expect(activePlayer.discard.length).toBe(0);
    expect(otherPlayer.discard.length).toBe(0);
    expect(activePlayer.hand.length).toBe(5);
    expect(otherPlayer.hand.length).toBe(5);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Разыгрывается, если карты только в руке', async () => {
    activePlayer.deck = [];
    activePlayer.hand.splice(-2);

    await lawlessness22.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness22.played).toBeFalsy();
    expect(activePlayer.deck.length).toBe(0);
    expect(otherPlayer.deck.length).toBe(5);
    expect(activePlayer.discard.length).toBe(0);
    expect(otherPlayer.discard.length).toBe(0);
    expect(activePlayer.hand.length).toBe(3);
    expect(otherPlayer.hand.length).toBe(5);
    expect(activePlayer.totalPower).toBe(0);
  });
});
