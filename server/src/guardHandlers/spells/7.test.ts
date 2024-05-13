import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('spells 7', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let cardAttack: Card;
  let spell7: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    cardAttack = testHelper.createMockCard(room, cardMap[ECardTypes.spells][4]);
    testHelper.giveCardToPlayer(cardAttack, activePlayer);
    spell7 = testHelper.createMockCard(room, cardMap[ECardTypes.spells][7]);
    testHelper.giveCardToPlayer(spell7, otherPlayer);
  });

  test('Разыгрывается и наносит урон атакующему', async () => {
    await spell7.playGuard({ cardAttack, attacker: activePlayer, damage: 5 });

    expect(spell7.played).toBeFalsy();
    expect(otherPlayer.hp).toBe(20);
    expect(activePlayer.hp).toBe(18);
    expect(otherPlayer.deck.length).toBe(4);
    expect(otherPlayer.hand.length).toBe(6);
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });

  test('Разыгрывается и не наносит урон без атакующего', async () => {
    await spell7.playGuard({ cardAttack, damage: 5 });

    expect(spell7.played).toBeFalsy();
    expect(otherPlayer.hp).toBe(20);
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.deck.length).toBe(4);
    expect(otherPlayer.hand.length).toBe(6);
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });
});
