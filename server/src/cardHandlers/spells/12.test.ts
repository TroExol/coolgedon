import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;

describe('spells 12', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let spell12: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    spell12 = testHelper.createMockCard(room, cardMap[ECardTypes.spells][12]);
    testHelper.giveCardToPlayer(spell12, activePlayer);
  });

  test('Разыгрывается и уничтожает карту', async () => {
    const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    const card3 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    activePlayer.discard = [card1, card2, card3];

    spyOn(activePlayer, 'selectCards').mockResolvedValue({ cards: [card2] });

    await spell12.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(spell12.played).toBeTruthy();
    expect(activePlayer.discard.length).toBe(2);
    expect(activePlayer.discard.includes(card2)).toBeFalsy();
    expect(room.removed.cards.length).toBe(1);
    expect(room.removed.cards.includes(card2)).toBeTruthy();
    expect(activePlayer.totalPower).toBe(1);
  });

  test('Разыгрывается и не уничтожает карту, если не выбрана', async () => {
    const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    const card3 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    activePlayer.discard = [card1, card2, card3];

    spyOn(activePlayer, 'selectCards').mockResolvedValue({ cards: [] });

    await spell12.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(spell12.played).toBeTruthy();
    expect(activePlayer.discard.length).toBe(3);
    expect(room.removed.cards.length).toBe(0);
    expect(activePlayer.totalPower).toBe(1);
  });

  test('Разыгрывается и не уничтожает карту, если их нет', async () => {
    await spell12.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(spell12.played).toBeTruthy();
    expect(activePlayer.discard.length).toBe(0);
    expect(room.removed.cards.length).toBe(0);
    expect(activePlayer.totalPower).toBe(1);
  });
});
