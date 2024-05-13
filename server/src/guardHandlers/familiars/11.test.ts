import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;

describe('familiars 11', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let cardAttack: Card;
  let familiar11: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    cardAttack = testHelper.createMockCard(room, cardMap[ECardTypes.spells][4]);
    testHelper.giveCardToPlayer(cardAttack, activePlayer);
    familiar11 = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][11]);
    testHelper.giveCardToPlayer(familiar11, otherPlayer);
  });

  test('Разыгрывается, перенаправляет атаку и удаляет карту', async () => {
    const card = otherPlayer.hand[0];

    spyOn(otherPlayer, 'selectCards').mockResolvedValue({ cards: [card] });

    await familiar11.playGuard({ cardAttack, attacker: activePlayer, damage: 5 });

    expect(familiar11.played).toBeFalsy();
    expect(activePlayer.hp).toBe(15);
    expect(otherPlayer.deck.length).toBe(4);
    expect(otherPlayer.hand.length).toBe(5);
    expect(otherPlayer.hand.includes(card)).toBeFalsy();
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });

  test('Разыгрывается, перенаправляет атаку и не удаляет карту', async () => {
    const card = otherPlayer.hand[0];

    spyOn(otherPlayer, 'selectCards').mockResolvedValue({ cards: [] });

    await familiar11.playGuard({ cardAttack, attacker: activePlayer, damage: 5 });

    expect(familiar11.played).toBeFalsy();
    expect(activePlayer.hp).toBe(15);
    expect(otherPlayer.deck.length).toBe(4);
    expect(otherPlayer.hand.length).toBe(6);
    expect(otherPlayer.hand.includes(card)).toBeTruthy();
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });

  test('Разыгрывается и не перенаправляет атаку без атакующего', async () => {
    spyOn(otherPlayer, 'selectCards').mockResolvedValue({ cards: [] });

    await familiar11.playGuard({ cardAttack, damage: 5 });

    expect(familiar11.played).toBeFalsy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.deck.length).toBe(4);
    expect(otherPlayer.hand.length).toBe(6);
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });
});
