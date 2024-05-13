import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('wizards 8', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let wizard8: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    wizard8 = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][8]);
    testHelper.giveCardToPlayer(wizard8, activePlayer);
  });

  test('Разыгрывается и сбрасывает карты', async () => {
    await wizard8.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard8.played).toBeTruthy();
    expect(activePlayer.deck.length).toBe(1);
    expect(activePlayer.hand.length).toBe(4);
    expect(activePlayer.discard.length).toBe(6);
    expect(activePlayer.totalPower).toBe(1);
  });

  test('Разыгрывается и не сбрасывает карты, если ранее есть разыгранная карта', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    room.onCurrentTurn.playedCards[ECardTypes.creatures] = [card];

    await wizard8.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard8.played).toBeTruthy();
    expect(activePlayer.deck.length).toBe(5);
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.totalPower).toBe(1);
  });
});
