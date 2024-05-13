import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('familiars 8', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let cardAttack: Card;
  let familiar8: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    cardAttack = testHelper.createMockCard(room, cardMap[ECardTypes.spells][4]);
    testHelper.giveCardToPlayer(cardAttack, activePlayer);
    familiar8 = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][8]);
    testHelper.giveCardToPlayer(familiar8, otherPlayer);
  });

  test('Разыгрывается и перенаправляет атаку', async () => {
    await familiar8.playGuard({ cardAttack, attacker: activePlayer, damage: 5 });

    expect(familiar8.played).toBeFalsy();
    expect(activePlayer.hp).toBe(11);
    expect(otherPlayer.deck.length).toBe(4);
    expect(otherPlayer.hand.length).toBe(6);
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });

  test('Разыгрывается и не перенаправляет атаку без атакующего', async () => {
    await familiar8.playGuard({ cardAttack, damage: 5 });

    expect(familiar8.played).toBeFalsy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.deck.length).toBe(4);
    expect(otherPlayer.hand.length).toBe(6);
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });
});
