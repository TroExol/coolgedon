import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('creatures 7', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let creature7: Card;
  let cardAttack: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    creature7 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][7]);
    testHelper.giveCardToPlayer(creature7, otherPlayer);
    cardAttack = testHelper.createMockCard(room, cardMap[ECardTypes.spells][4]);
    testHelper.giveCardToPlayer(cardAttack, activePlayer);
  });

  test('Разыгрывается и удаляет карту', async () => {
    const topCard = getLastElement(otherPlayer.deck)!;

    spyOn(otherPlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [topCard] });

    await creature7.playGuard({ cardAttack, attacker: activePlayer, damage: 5 });

    expect(creature7.played).toBeFalsy();
    expect(otherPlayer.deck.length).toBe(4);
    expect(otherPlayer.hand.length).toBe(5);
    expect(otherPlayer.hand.includes(topCard)).toBeFalsy();
    expect(otherPlayer.hp).toBe(20);
    expect(room.removed.cards.length).toBe(1);
    expect(room.removed.cards.includes(topCard)).toBeTruthy();
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });

  test('Разыгрывается и не удаляет карту', async () => {
    const topCard = getLastElement(otherPlayer.deck)!;

    spyOn(otherPlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

    await creature7.playGuard({ cardAttack, attacker: activePlayer, damage: 5 });

    expect(creature7.played).toBeFalsy();
    expect(otherPlayer.deck.length).toBe(4);
    expect(otherPlayer.hand.length).toBe(6);
    expect(otherPlayer.hand.includes(topCard)).toBeTruthy();
    expect(otherPlayer.hp).toBe(20);
    expect(room.removed.cards.length).toBe(0);
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });
});
