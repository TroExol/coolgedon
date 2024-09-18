import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;

describe('treasures 12', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let cardAttack: Card;
  let treasure12: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    cardAttack = testHelper.createMockCard(room, cardMap[ECardTypes.spells][4]);
    testHelper.giveCardToPlayer(cardAttack, activePlayer);
    treasure12 = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][12]);
    testHelper.giveCardToPlayer(treasure12, otherPlayer);
  });

  test('Разыгрывается и уничтожает карту из руки', async () => {
    const topCard = otherPlayer.hand[0];

    spyOn(room, 'emitWithAck').mockImplementation(async () => ({ selectedCards: [topCard.format()] }));

    await treasure12.playGuard({ cardAttack, attacker: activePlayer, damage: 5 });

    expect(treasure12.played).toBeFalsy();
    expect(otherPlayer.hand.length).toBe(4);
    expect(otherPlayer.hand.includes(topCard)).toBeFalsy();
    expect(room.removed.cards.length).toBe(1);
    expect(room.removed.cards.includes(topCard)).toBeTruthy();
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });

  test('Разыгрывается и уничтожает карту из сброса', async () => {
    otherPlayer.discard = [...otherPlayer.deck];
    otherPlayer.deck = [];
    const topCard = otherPlayer.discard[0];

    spyOn(room, 'emitWithAck').mockImplementation(async () => ({ selectedCards: [topCard.format()] }));

    await treasure12.playGuard({ cardAttack, attacker: activePlayer, damage: 5 });

    expect(treasure12.played).toBeFalsy();
    expect(otherPlayer.discard.length).toBe(5);
    expect(otherPlayer.discard.includes(topCard)).toBeFalsy();
    expect(room.removed.cards.length).toBe(1);
    expect(room.removed.cards.includes(topCard)).toBeTruthy();
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });

  test('Разыгрывается и не уничтожает карту', async () => {
    const topCard = otherPlayer.hand[0];

    spyOn(room, 'emitWithAck').mockImplementation(async () => ({ selectedCards: [] }));

    await treasure12.playGuard({ cardAttack, attacker: activePlayer, damage: 5 });

    expect(treasure12.played).toBeFalsy();
    expect(otherPlayer.hand.length).toBe(5);
    expect(otherPlayer.hand.includes(topCard)).toBeTruthy();
    expect(room.removed.cards.length).toBe(0);
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });
});
