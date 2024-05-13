import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import { buyShopCard } from 'Event/buyShopCard';

import spyOn = jest.spyOn;

describe('buyShopCard', () => {
  let room: Room;
  let activePlayer: Player;
  let shopCard3: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    shopCard3 = room.shop[2];
    const prop = testHelper.createMockProp(propMap[1]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop });
    testHelper.addPlayerToRoom(room, activePlayer);

    spyOn(room, 'logEvent');
    spyOn(room, 'sendInfo');
  });

  test('Приобретается карта с барахолки', () => {
    room.onCurrentTurn.additionalPower = 20;

    buyShopCard({ room, card: shopCard3 });

    expect(room.onCurrentTurn.additionalPower).toBe(20);
    expect(room.shop.length).toBe(5);
    expect(room.shop.indexOf(shopCard3)).toBe(-1);
    expect(room.onCurrentTurn.powerWasted).toBe(shopCard3.getTotalCost(activePlayer));
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard.slice(-1)[0]).toEqual(shopCard3);
    // + 1 в takeCardsTo
    expect(room.sendInfo).toHaveBeenCalledTimes(2);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer купил карту с барахолки');
  });

  test('Приобретается карта с барахолки и кладется в колоду с prop 8', () => {
    room.onCurrentTurn.additionalPower = 20;
    const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]); // cost 4
    const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][8]); // cost 2
    room.shop[2] = card1;
    room.shop[3] = card2;
    const prop8 = testHelper.createMockProp({ ...propMap[8], room });
    activePlayer.props = [prop8];

    buyShopCard({ room, card: card1 });

    expect(room.onCurrentTurn.additionalPower).toBe(20);
    expect(room.shop.length).toBe(5);
    expect(room.shop.indexOf(card1)).toBe(-1);
    expect(room.shop.indexOf(card2)).toBe(3);
    expect(room.onCurrentTurn.powerWasted).toBe(4);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.deck.slice(-1)[0]).toEqual(card1);
    // + 1 в takeCardsTo
    expect(room.sendInfo).toHaveBeenCalledTimes(2);
    expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer купил карту с барахолки');

    buyShopCard({ room, card: card2 });

    expect(room.shop.length).toBe(5);
    expect(room.shop.indexOf(card2)).toBe(-1);
    expect(room.onCurrentTurn.powerWasted).toBe(6);
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.deck.slice(-1)[0]).toEqual(card2);
  });

  test('Нельзя купить, если не хватает силы', () => {
    room.onCurrentTurn.additionalPower = 0;

    buyShopCard({ room, card: shopCard3 });

    expect(room.onCurrentTurn.additionalPower).toBe(0);
    expect(room.shop.length).toBe(5);
    expect(room.shop.indexOf(shopCard3)).toBe(2);
    expect(room.onCurrentTurn.powerWasted).toBe(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
  });

  test('Нельзя купить, если нет активного игрока', () => {
    room.onCurrentTurn.additionalPower = 20;
    room.players = {};

    buyShopCard({ room, card: shopCard3 });

    expect(room.onCurrentTurn.additionalPower).toBe(20);
    expect(room.shop.length).toBe(5);
    expect(room.shop.indexOf(shopCard3)).toBe(2);
    expect(room.onCurrentTurn.powerWasted).toBe(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
  });

  test('Нельзя купить, если игра закончилась', () => {
    room.onCurrentTurn.additionalPower = 20;
    room.gameEnded = true;

    buyShopCard({ room, card: shopCard3 });

    expect(room.onCurrentTurn.additionalPower).toBe(20);
    expect(room.shop.length).toBe(5);
    expect(room.shop.indexOf(shopCard3)).toBe(2);
    expect(room.onCurrentTurn.powerWasted).toBe(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
  });

  test('Нельзя купить, если карт нет', () => {
    room.onCurrentTurn.additionalPower = 20;
    room.shop = [];

    buyShopCard({ room, card: shopCard3 });

    expect(room.onCurrentTurn.additionalPower).toBe(20);
    expect(room.shop.length).toBe(0);
    expect(room.onCurrentTurn.powerWasted).toBe(0);
    expect(activePlayer.discard.length).toBe(0);
    expect(room.sendInfo).toHaveBeenCalledTimes(0);
    expect(room.logEvent).toHaveBeenCalledTimes(0);
  });
});
