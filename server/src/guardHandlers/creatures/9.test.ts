import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('creatures 9', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let creature9: Card;
  let cardAttack: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    creature9 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][9]);
    testHelper.giveCardToPlayer(creature9, otherPlayer);
    cardAttack = testHelper.createMockCard(room, cardMap[ECardTypes.spells][4]);
    testHelper.giveCardToPlayer(cardAttack, activePlayer);
  });

  test('Разыгрывается и отдает карту из руки', async () => {
    const topCard = otherPlayer.hand[0];

    spyOn(room, 'wsSendMessageAsync').mockImplementation(fn()).mockResolvedValue({ selectedCards: [topCard] });

    await creature9.playGuard({ cardAttack, attacker: activePlayer, damage: 5 });

    expect(creature9.played).toBeFalsy();
    expect(otherPlayer.hand.length).toBe(4);
    expect(otherPlayer.hand.includes(topCard)).toBeFalsy();
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard.includes(topCard)).toBeTruthy();
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });

  test('Разыгрывается и отдает карту из сброса', async () => {
    otherPlayer.discard = [...otherPlayer.deck];
    otherPlayer.deck = [];
    const topCard = otherPlayer.discard[0];

    spyOn(room, 'wsSendMessageAsync').mockImplementation(fn()).mockResolvedValue({ selectedCards: [topCard] });

    await creature9.playGuard({ cardAttack, attacker: activePlayer, damage: 5 });

    expect(creature9.played).toBeFalsy();
    expect(otherPlayer.discard.length).toBe(5);
    expect(otherPlayer.discard.includes(topCard)).toBeFalsy();
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard.includes(topCard)).toBeTruthy();
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });

  test('Разыгрывается и не передает карту', async () => {
    const topCard = otherPlayer.hand[0];

    spyOn(room, 'wsSendMessageAsync').mockImplementation(fn()).mockResolvedValue({ selectedCards: [] });

    await creature9.playGuard({ cardAttack, attacker: activePlayer, damage: 5 });

    expect(creature9.played).toBeFalsy();
    expect(otherPlayer.hand.length).toBe(5);
    expect(otherPlayer.hand.includes(topCard)).toBeTruthy();
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });

  test('Не разыгрывается без атакующего', async () => {
    const topCard = otherPlayer.hand[0];

    spyOn(room, 'wsSendMessageAsync').mockImplementation(fn()).mockResolvedValue({ selectedCards: [topCard] });

    await creature9.playGuard({ cardAttack, damage: 5 });

    expect(creature9.played).toBeFalsy();
    expect(otherPlayer.hand.length).toBe(5);
    expect(otherPlayer.hand.includes(topCard)).toBeTruthy();
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.totalPower).toBe(0);
    expect(otherPlayer.totalPower).toBe(0);
  });
});
