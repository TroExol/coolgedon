import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;

describe('legends 10', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let legend10: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    legend10 = testHelper.createMockCard(room, cardMap[ECardTypes.legends][10]);
    testHelper.giveCardToPlayer(legend10, activePlayer);
  });

  test('Разыгрывается и удаляет ото всюду', async () => {
    const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.sluggishStick]);
    const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.sluggishStick]);
    activePlayer.hand.push(card1);
    activePlayer.discard = [card2];

    spyOn(activePlayer, 'selectVariant').mockResolvedValue(3);

    await legend10.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend10.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(7);
    expect(activePlayer.hand.includes(card1)).toBeFalsy();
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Разыгрывается и удаляет палку из руки', async () => {
    const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.sluggishStick]);
    const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.sluggishStick]);
    activePlayer.hand.push(card1);
    activePlayer.discard = [card2];

    spyOn(activePlayer, 'selectVariant').mockResolvedValue(1);

    await legend10.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend10.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(7);
    expect(activePlayer.hand.includes(card1)).toBeFalsy();
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard.includes(card2)).toBeTruthy();
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Разыгрывается и удаляет палку из сброса', async () => {
    const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.sluggishStick]);
    const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.sluggishStick]);
    activePlayer.hand.push(card1);
    activePlayer.discard = [card2];

    spyOn(activePlayer, 'selectVariant').mockResolvedValue(2);

    await legend10.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend10.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(8);
    expect(activePlayer.hand.includes(card1)).toBeTruthy();
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Разыгрывается и ничего не удаляет, если вариант не выбран', async () => {
    const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.sluggishStick]);
    const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.sluggishStick]);
    activePlayer.hand.push(card1);
    activePlayer.discard = [card2];

    spyOn(activePlayer, 'selectVariant').mockResolvedValue(undefined);

    await legend10.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend10.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(8);
    expect(activePlayer.hand.includes(card1)).toBeTruthy();
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard.includes(card2)).toBeTruthy();
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Разыгрывается и ничего не удаляет, если нет палок', async () => {
    await legend10.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend10.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(7);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.totalPower).toBe(2);
  });
});
