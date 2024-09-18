import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('lawlessnesses 5', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let lawlessness5: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    lawlessness5 = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][5]);
  });

  test('Разыгрывается', async () => {
    room.deck.push(testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]));
    room.deck.push(testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]));
    const topRoomDeckCard1 = room.deck[room.deck.length - 1];
    const topRoomDeckCard2 = room.deck[room.deck.length - 2];
    const topActivePlayerDeckCard = getLastElement(activePlayer.deck)!;
    const topOtherPlayerDeckCard = getLastElement(otherPlayer.deck)!;

    spyOn(activePlayer, 'selectVariant').mockImplementation(fn()).mockResolvedValue(1);
    spyOn(otherPlayer, 'selectVariant').mockImplementation(fn()).mockResolvedValue(1);

    await lawlessness5.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness5.played).toBeFalsy();
    expect(room.deck.indexOf(topRoomDeckCard1)).toBe(-1);
    expect(room.deck.indexOf(topRoomDeckCard2)).toBe(-1);
    expect([topRoomDeckCard1, topRoomDeckCard2].includes(activePlayer.discard[0])).toBeTruthy();
    expect(activePlayer.discard[0].ownerNickname).toBe(activePlayer.nickname);
    expect([topRoomDeckCard1, topRoomDeckCard2].includes(otherPlayer.discard[0])).toBeTruthy();
    expect(otherPlayer.discard[0].ownerNickname).toBe(otherPlayer.nickname);
    expect(activePlayer.deck.indexOf(topActivePlayerDeckCard)).toBe(-1);
    expect(otherPlayer.deck.indexOf(topOtherPlayerDeckCard)).toBe(-1);
    expect(room.removed.cards.length).toBe(2);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Не разыгрывается, если не выбрано', async () => {
    const topActivePlayerDeckCard = getLastElement(activePlayer.deck)!;
    const topOtherPlayerDeckCard = getLastElement(otherPlayer.deck)!;

    spyOn(activePlayer, 'selectVariant').mockImplementation(fn()).mockResolvedValue(undefined);
    spyOn(otherPlayer, 'selectVariant').mockImplementation(fn()).mockResolvedValue(undefined);

    await lawlessness5.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness5.played).toBeFalsy();
    expect(activePlayer.discard.length).toBe(0);
    expect(otherPlayer.discard.length).toBe(0);
    expect(activePlayer.deck.indexOf(topActivePlayerDeckCard)).not.toBe(-1);
    expect(otherPlayer.deck.indexOf(topOtherPlayerDeckCard)).not.toBe(-1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Удаляет полученную карту, если других нет', async () => {
    room.deck.push(testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]));
    room.deck.push(testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]));
    const topRoomDeckCard1 = room.deck[room.deck.length - 1];
    const topRoomDeckCard2 = room.deck[room.deck.length - 2];
    activePlayer.deck = [];
    otherPlayer.deck = [];

    spyOn(activePlayer, 'selectVariant').mockImplementation(fn()).mockResolvedValue(1);
    spyOn(otherPlayer, 'selectVariant').mockImplementation(fn()).mockResolvedValue(1);

    await lawlessness5.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness5.played).toBeFalsy();
    expect(room.deck.indexOf(topRoomDeckCard1)).toBe(-1);
    expect(room.deck.indexOf(topRoomDeckCard2)).toBe(-1);
    expect(activePlayer.discard.length).toBe(0);
    expect(otherPlayer.discard.length).toBe(0);
    expect(activePlayer.deck.length).toBe(0);
    expect(otherPlayer.deck.length).toBe(0);
    expect(room.removed.cards.length).toBe(2);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Разыгрывается и замешивает колоду', async () => {
    room.deck.push(testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]));
    room.deck.push(testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]));
    const topRoomDeckCard1 = room.deck[room.deck.length - 1];
    const topRoomDeckCard2 = room.deck[room.deck.length - 2];
    activePlayer.discard = [...activePlayer.deck];
    activePlayer.deck = [];
    otherPlayer.discard = [...otherPlayer.deck];
    otherPlayer.deck = [];

    spyOn(activePlayer, 'selectVariant').mockImplementation(fn()).mockResolvedValue(1);
    spyOn(otherPlayer, 'selectVariant').mockImplementation(fn()).mockResolvedValue(1);

    await lawlessness5.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness5.played).toBeFalsy();
    expect(room.deck.indexOf(topRoomDeckCard1)).toBe(-1);
    expect(room.deck.indexOf(topRoomDeckCard2)).toBe(-1);
    expect(activePlayer.discard.length).toBe(0);
    expect(otherPlayer.discard.length).toBe(0);
    expect(activePlayer.deck.length).toBe(5);
    expect(otherPlayer.deck.length).toBe(5);
    expect(room.removed.cards.length).toBe(2);
    expect(activePlayer.totalPower).toBe(0);
  });
});
