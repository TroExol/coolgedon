import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

describe('wizards 7', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let cardAttack: Card;
  let wizard7: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    cardAttack = testHelper.createMockCard(room, cardMap[ECardTypes.spells][4]);
    testHelper.giveCardToPlayer(cardAttack, activePlayer);
    wizard7 = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][7]);
    testHelper.giveCardToPlayer(wizard7, otherPlayer);
  });

  test('Защищает', async () => {
    await wizard7.playGuard({ cardAttack, attacker: activePlayer, damage: 5 });

    expect(wizard7.played).toBeFalsy();
    expect(otherPlayer.hp).toBe(20);
    expect(otherPlayer.hand.includes(wizard7)).toBeFalsy();
    expect(otherPlayer.hand.length).toBe(5);
    expect(otherPlayer.discard.length).toBe(1);
    expect(otherPlayer.discard.includes(wizard7)).toBeTruthy();
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });
});
