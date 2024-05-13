import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('wizards 2', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let cardAttack: Card;
  let wizard2: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    cardAttack = testHelper.createMockCard(room, cardMap[ECardTypes.spells][4]);
    testHelper.giveCardToPlayer(cardAttack, activePlayer);
    wizard2 = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][2]);
    testHelper.giveCardToPlayer(wizard2, otherPlayer);
  });

  test('Разыгрывается и берет карту', async () => {
    const topCard1 = otherPlayer.deck.slice(-2, -1)[0];
    const topCard2 = otherPlayer.deck.slice(-1)[0];

    spyOn(otherPlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [topCard2] }); // Берет ее

    await wizard2.playGuard({ cardAttack, attacker: activePlayer, damage: 5 });

    expect(wizard2.played).toBeFalsy();
    expect(otherPlayer.hand.includes(topCard1)).toBeFalsy();
    expect(otherPlayer.hand.includes(topCard2)).toBeTruthy();
    expect(otherPlayer.hand.length).toBe(6);
    expect(otherPlayer.discard.length).toBe(2);
    expect(otherPlayer.discard.includes(topCard1)).toBeTruthy();
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });

  test('Разыгрывается и берет карту, если она одна', async () => {
    const card = otherPlayer.deck.slice(-1)[0];
    otherPlayer.deck = [card];

    await wizard2.playGuard({ cardAttack, attacker: activePlayer, damage: 5 });

    expect(wizard2.played).toBeFalsy();
    expect(otherPlayer.hand.length).toBe(6);
    expect(otherPlayer.hand.includes(card)).toBeTruthy();
    expect(otherPlayer.discard.length).toBe(1);
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });

  test('Замешивает колоду и разыгрывает', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    otherPlayer.discard = [card];
    otherPlayer.deck = [];

    await wizard2.playGuard({ cardAttack, attacker: activePlayer, damage: 5 });

    expect(wizard2.played).toBeFalsy();
    expect(otherPlayer.hand.length).toBe(6);
    expect(otherPlayer.hand.includes(card)).toBeTruthy();
    expect(otherPlayer.discard.length).toBe(1);
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });

  test('Разыгрывается и не берет карту, если нет карт', async () => {
    otherPlayer.deck = [];

    await wizard2.playGuard({ cardAttack, attacker: activePlayer, damage: 5 });

    expect(wizard2.played).toBeFalsy();
    expect(otherPlayer.hand.length).toBe(5);
    expect(otherPlayer.discard.length).toBe(1);
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });
});
