import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';

import spyOn = jest.spyOn;

describe('crazyMagic', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let crazyMagic: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    crazyMagic = testHelper.createMockCard(room, cardMap[ECardTypes.crazyMagic]);
    testHelper.giveCardToPlayer(crazyMagic, activePlayer);
  });

  test('Разыгрывается и дает мощь', async () => {
    spyOn(activePlayer, 'selectVariant').mockResolvedValue(1);

    await crazyMagic.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(crazyMagic.played).toBeTruthy();
    expect(otherPlayer.deck.length).toBe(5);
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Разыгрывается и заимствует карту', async () => {
    const topCard = getLastElement(otherPlayer.deck)!;

    spyOn(activePlayer, 'selectVariant').mockResolvedValue(2);
    spyOn(activePlayer, 'selectTarget').mockResolvedValue(otherPlayer);

    await crazyMagic.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(crazyMagic.played).toBeTruthy();
    expect(otherPlayer.deck.length).toBe(4);
    expect(activePlayer.hand.length).toBe(7);
    expect(activePlayer.hand.includes(topCard)).toBeTruthy();
    expect(topCard.ownerNickname).toBe(otherPlayer.nickname);
    expect(topCard.tempOwnerNickname).toBe(activePlayer.nickname);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Разыгрывается и забирает постоянку', async () => {
    const place = testHelper.createMockCard(room, cardMap[ECardTypes.places][1]);
    place.ownerNickname = otherPlayer.nickname;
    otherPlayer.deck.push(place);

    spyOn(activePlayer, 'selectVariant').mockResolvedValue(2);
    spyOn(activePlayer, 'selectTarget').mockResolvedValue(otherPlayer);

    await crazyMagic.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(crazyMagic.played).toBeTruthy();
    expect(otherPlayer.deck.length).toBe(5);
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.hand.includes(place)).toBeFalsy();
    expect(activePlayer.activePermanent.length).toBe(1);
    expect(activePlayer.activePermanent.includes(place)).toBeTruthy();
    expect(place.ownerNickname).toBe(activePlayer.nickname);
    expect(place.tempOwnerNickname).toBeUndefined();
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Не разыгрывается, если не выбрано действие', async () => {
    spyOn(activePlayer, 'selectVariant').mockResolvedValue(undefined);

    await crazyMagic.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(crazyMagic.played).toBeFalsy();
    expect(otherPlayer.deck.length).toBe(5);
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.activePermanent.length).toBe(0);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Разыгрывается и замешивает колоду', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    card.ownerNickname = otherPlayer.nickname;
    otherPlayer.discard = [card];
    otherPlayer.deck = [];

    spyOn(activePlayer, 'selectVariant').mockResolvedValue(2);
    spyOn(activePlayer, 'selectTarget').mockResolvedValue(otherPlayer);

    await crazyMagic.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(crazyMagic.played).toBeTruthy();
    expect(otherPlayer.discard.length).toBe(0);
    expect(otherPlayer.deck.length).toBe(0);
    expect(activePlayer.hand.length).toBe(7);
    expect(activePlayer.hand.includes(card)).toBeTruthy();
    expect(card.ownerNickname).toBe(otherPlayer.nickname);
    expect(card.tempOwnerNickname).toBe(activePlayer.nickname);
    expect(activePlayer.activePermanent.length).toBe(0);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Разыгрывается и не берет карту, если нет', async () => {
    otherPlayer.discard = [];
    otherPlayer.deck = [];

    spyOn(activePlayer, 'selectVariant').mockResolvedValue(2);
    spyOn(activePlayer, 'selectTarget').mockResolvedValue(otherPlayer);

    await crazyMagic.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(crazyMagic.played).toBeTruthy();
    expect(otherPlayer.discard.length).toBe(0);
    expect(otherPlayer.deck.length).toBe(0);
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.activePermanent.length).toBe(0);
    expect(activePlayer.totalPower).toBe(0);
  });
});
