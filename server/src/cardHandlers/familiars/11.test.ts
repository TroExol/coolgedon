import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('familiars 11', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let familiar11: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    familiar11 = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][11]);
    testHelper.giveCardToPlayer(familiar11, activePlayer);
  });

  test('Разыгрывается', async () => {
    room.wasLawlessnessesOnCurrentTurn = true;
    const topCard = getLastElement(room.shop)!;

    const selectCardsSpy = spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [topCard] });

    await familiar11.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(familiar11.played).toBeTruthy();
    expect(selectCardsSpy.mock.calls[0][0].cards).toEqual(room.shop);
    expect(room.shop.indexOf(topCard)).toBe(-1);
    expect(room.shop.length).toBe(5);
    expect(activePlayer.totalPower).toBe(3);
  });

  test('Разыгрывается, если не выбрана карта', async () => {
    const topCard = getLastElement(room.shop)!;

    const selectCardsSpy = spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

    await familiar11.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(familiar11.played).toBeTruthy();
    expect(selectCardsSpy.mock.calls[0][0].cards).toEqual(room.shop);
    expect(room.shop.indexOf(topCard)).not.toBe(-1);
    expect(room.shop.length).toBe(5);
    expect(activePlayer.totalPower).toBe(3);
  });
});
