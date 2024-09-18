import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';

import spyOn = jest.spyOn;

describe('lawlessnesses 8', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let otherPlayer2: Player;
  let lawlessness8: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    otherPlayer2 = testHelper.createMockPlayer({ room, nickname: 'otherPlayer2', prop: prop4 }); // Правый враг
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    testHelper.addPlayerToRoom(room, otherPlayer2);
    lawlessness8 = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][8]);
  });

  test('Разыгрывается', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    otherPlayer2.discard = [card];
    const topHandCard = getLastElement(otherPlayer2.hand)!;
    const topDiscardCard = getLastElement(otherPlayer2.discard)!;

    spyOn(otherPlayer2, 'selectCards').mockImplementation(async params => {
      if (params.cards === otherPlayer2.hand) {
        return { cards: [topHandCard] };
      }
      return { cards: [topDiscardCard] };
    });

    await lawlessness8.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness8.played).toBeFalsy();
    expect(otherPlayer2.hand.length).toBe(4);
    expect(otherPlayer2.hand.includes(topHandCard)).toBeFalsy();
    expect(otherPlayer2.discard.length).toBe(0);
    expect(otherPlayer2.selectCards).toHaveBeenCalledTimes(2);
    expect(room.removed.cards.length).toBe(2);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Не предлагает удалить карты на руке, если их нет', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    otherPlayer2.discard = [card];
    const topDiscardCard = getLastElement(otherPlayer2.discard)!;
    otherPlayer2.hand = [];

    spyOn(otherPlayer2, 'selectCards').mockImplementation(async () => ({ cards: [topDiscardCard] }));

    await lawlessness8.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness8.played).toBeFalsy();
    expect(otherPlayer2.hand.length).toBe(0);
    expect(otherPlayer2.discard.length).toBe(0);
    expect(otherPlayer2.selectCards).toHaveBeenCalledTimes(1);
    expect(room.removed.cards.length).toBe(1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Не предлагает удалить карты из сброса, если их нет', async () => {
    const topHandCard = getLastElement(otherPlayer2.hand)!;

    spyOn(otherPlayer2, 'selectCards').mockImplementation(async () => ({ cards: [topHandCard] }));

    await lawlessness8.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness8.played).toBeFalsy();
    expect(otherPlayer2.hand.length).toBe(4);
    expect(otherPlayer2.discard.length).toBe(0);
    expect(otherPlayer2.hand.includes(topHandCard)).toBeFalsy();
    expect(otherPlayer2.selectCards).toHaveBeenCalledTimes(1);
    expect(room.removed.cards.length).toBe(1);
    expect(activePlayer.totalPower).toBe(0);
  });
});
