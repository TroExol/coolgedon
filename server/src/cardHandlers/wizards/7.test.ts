import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;

describe('wizards 7', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let wizard7: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    wizard7 = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][7]);
    testHelper.giveCardToPlayer(wizard7, activePlayer);
  });

  test('Разыгрывается', async () => {
    spyOn(activePlayer, 'selectTarget').mockResolvedValue(otherPlayer);

    await wizard7.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard7.played).toBeTruthy();
    expect(activePlayer.deck.length).toBe(4);
    expect(otherPlayer.deck.length).toBe(4);
    expect(activePlayer.hand.length).toBe(7);
    expect(otherPlayer.hand.length).toBe(6);
    expect(activePlayer.totalPower).toBe(1);
  });

  test('Не разыгрывается, если не выбрана цель', async () => {
    spyOn(activePlayer, 'selectTarget').mockResolvedValue(undefined);
    spyOn(otherPlayer, 'guard');

    await wizard7.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard7.played).toBeFalsy();
    expect(activePlayer.deck.length).toBe(5);
    expect(otherPlayer.deck.length).toBe(5);
    expect(activePlayer.hand.length).toBe(6);
    expect(otherPlayer.hand.length).toBe(5);
    expect(activePlayer.totalPower).toBe(0);
  });
});
