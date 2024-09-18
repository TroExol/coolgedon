import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('lawlessnesses 24', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let lawlessness24: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    lawlessness24 = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][24]);
  });

  test('Разыгрывается', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    activePlayer.hand.push(card);
    activePlayer.hp = 10;

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [card] });
    spyOn(otherPlayer, 'selectCards').mockImplementation(async params => ({ cards: params.cards }));

    await lawlessness24.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness24.played).toBeFalsy();
    expect(activePlayer.hp).toBe(23);
    expect(otherPlayer.hp).toBe(25);
    expect(activePlayer.hand.length).toBe(5);
    expect(activePlayer.hand.includes(card)).toBeFalsy();
    expect(otherPlayer.hand.length).toBe(4);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Не разыгрывается, если нет руки', async () => {
    activePlayer.hand = [];
    otherPlayer.hand = [];

    await lawlessness24.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness24.played).toBeFalsy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(20);
    expect(activePlayer.hand.length).toBe(0);
    expect(otherPlayer.hand.length).toBe(0);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Не разыгрывается, если отказались', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    activePlayer.hand.push(card);

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });
    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

    await lawlessness24.play({ type: 'lawlessness', params: { player: activePlayer } });

    expect(lawlessness24.played).toBeFalsy();
    expect(activePlayer.hp).toBe(20);
    expect(otherPlayer.hp).toBe(20);
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.hand.includes(card)).toBeTruthy();
    expect(otherPlayer.hand.length).toBe(5);
    expect(activePlayer.totalPower).toBe(0);
  });
});
