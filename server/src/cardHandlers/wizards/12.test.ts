import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';

import spyOn = jest.spyOn;

describe('wizards 12', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let wizard12: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    wizard12 = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][12]);
    testHelper.giveCardToPlayer(wizard12, activePlayer);
  });

  test('Разыгрывается со стоимостью 0', async () => {
    const skull = testHelper.createMockSkull({ room, id: 14 });
    activePlayer.skulls = [skull];
    const topCard = getLastElement(activePlayer.deck)!;

    spyOn(activePlayer, 'selectCards').mockResolvedValue({ cards: [topCard] });
    spyOn(activePlayer, 'selectSkulls').mockResolvedValue({ skulls: [skull] });

    await wizard12.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard12.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(7);
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard[0]?.id).toBe(topCard.id);
    expect(activePlayer.hp).toBe(20);
    expect(activePlayer.skulls.length).toBe(1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Разыгрывается со стоимостью 4', async () => {
    const skull = testHelper.createMockSkull({ room, id: 14 });
    activePlayer.skulls = [skull];
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]); // cost 4
    activePlayer.deck.push(card);

    spyOn(activePlayer, 'selectCards').mockResolvedValue({ cards: [card] });
    spyOn(activePlayer, 'selectSkulls').mockResolvedValue({ skulls: [skull] });

    await wizard12.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard12.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(7);
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard[0]?.id).toBe(card.id);
    expect(activePlayer.hp).toBe(24);
    expect(activePlayer.skulls.length).toBe(1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Разыгрывается со стоимостью 5', async () => {
    const skull = testHelper.createMockSkull({ room, id: 14 });
    activePlayer.skulls = [skull];
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]); // cost 5
    activePlayer.hand.push(card);

    spyOn(activePlayer, 'selectCards').mockResolvedValue({ cards: [card] });
    spyOn(activePlayer, 'selectSkulls').mockResolvedValue({ skulls: [skull] });

    await wizard12.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard12.played).toBeTruthy();
    expect(activePlayer.hand.length).toBe(8);
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard[0]?.id).toBe(card.id);
    expect(activePlayer.hp).toBe(25);
    expect(activePlayer.skulls.length).toBe(0);
    expect(activePlayer.totalPower).toBe(0);
  });
});
