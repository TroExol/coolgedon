import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import * as testHelper from 'Helpers/tests';
import {
  getCardIn,
  getCardInFromClient,
  getCardsExceptCards,
  getCardsIn,
  getCardsInFromClient,
  getCountCardsIn,
  getLastElement,
  getMaxCostCards,
  getMaxHpPlayers,
  getMinCostCards,
  getMinHpPlayers,
  getPropInFromClient,
  getPropsExceptProps,
  getPropsInFromClient,
  getRandomElements,
  getRandomInt,
  getSkullInFromClient,
  getSkullsExceptSkulls,
  getSkullsInFromClient,
  getTotalDamage,
  shuffleArray,
  sleep,
  toPlayerVariant,
} from 'Helpers';

describe('Helpers', () => {
  describe('shuffleArray', () => {
    test('Корректно возвращает значения', () => {
      expect(shuffleArray([])).toEqual([]);
      expect(shuffleArray([1])).toEqual([1]);
      const arr = [1, 2, 3, 4, 5, 6];
      expect(shuffleArray(arr).length).toBe(6);
    });

    test('Не мутирует исходный массив', () => {
      const arr = [1, 2, 3, 4, 5, 6];
      shuffleArray(arr);
      expect(arr).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });

  describe('getRandomElements', () => {
    test('Корректно возвращает значения', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const result = getRandomElements(array, 5);
      expect(result).toHaveLength(5);
    });

    test('Не мутирует исходный массив', () => {
      const array = [1, 2, 3, 4, 5];
      getRandomElements(array, 2);
      expect(array).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('getRandomInt', () => {
    test('Корректно возвращает значения', () => {
      const min = 1;
      const max = 10;
      const result = getRandomInt(min, max);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
    });
  });

  describe('getCountCardsIn', () => {
    test('Корректно возвращает значения', () => {
      const card1 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][1]);
      const card3 = testHelper.createMockCard(undefined, cardMap[ECardTypes.wizards][1]);
      const card4 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][4]);
      const card5 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][5]);
      const cards = [card1, card2, card3, card4, card5];
      expect(getCountCardsIn(cards, ECardTypes.creatures)).toBe(4);
      expect(getCountCardsIn(cards, ECardTypes.creatures, 1)).toBe(2);
      expect(getCountCardsIn(cards, ECardTypes.treasures)).toBe(0);
      expect(getCountCardsIn(cards, ECardTypes.treasures, 1)).toBe(0);
    });
  });

  describe('getCardIn', () => {
    test('Корректно возвращает значения', () => {
      const card1 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][1]);
      const card3 = testHelper.createMockCard(undefined, cardMap[ECardTypes.wizards][1]);
      const card4 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][4]);
      const card5 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][5]);
      const cards = [card1, card2, card3, card4, card5];
      expect(getCardIn(cards, ECardTypes.creatures)).toEqual(card1);
      expect(getCardIn(cards, ECardTypes.wizards)).toEqual(card3);
      expect(getCardIn(cards, ECardTypes.creatures, 1)).toEqual(card1);
      expect(getCardIn(cards, ECardTypes.treasures)).toBeUndefined();
      expect(getCardIn(cards, ECardTypes.treasures, 1)).toBeUndefined();
    });
  });

  describe('getCardsIn', () => {
    test('Корректно возвращает значения', () => {
      const card1 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][1]);
      const card3 = testHelper.createMockCard(undefined, cardMap[ECardTypes.wizards][1]);
      const card4 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][4]);
      const card5 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][5]);
      const cards = [card1, card2, card3, card4, card5];
      expect(getCardsIn(cards, ECardTypes.creatures)).toEqual([card1, card2, card4, card5]);
      expect(getCardsIn(cards, ECardTypes.wizards)).toEqual([card3]);
      expect(getCardsIn(cards, ECardTypes.creatures, 1)).toEqual([card1, card2]);
      expect(getCardsIn(cards, ECardTypes.treasures)).toEqual([]);
      expect(getCardsIn(cards, ECardTypes.treasures, 1)).toEqual([]);
    });
  });

  describe('getTotalDamage', () => {
    test('Корректно возвращает значения', () => {
      const activePlayer = testHelper.createMockPlayer({ nickname: 'activePlayer' });
      expect(getTotalDamage(0)).toBe(0);
      expect(getTotalDamage(100)).toBe(100);
      expect(getTotalDamage(100, activePlayer)).toBe(100);
      const place6 = testHelper.createMockCard(undefined, cardMap[ECardTypes.places][6]);
      place6.ownerNickname = activePlayer.nickname;
      activePlayer.activePermanent.push(place6);
      expect(getTotalDamage(0, activePlayer)).toBe(0);
      expect(getTotalDamage(100, activePlayer)).toBe(200);
    });
  });

  describe('getCardsExceptCards', () => {
    test('Корректно возвращает значения', () => {
      const card1 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][1]);
      const card3 = testHelper.createMockCard(undefined, cardMap[ECardTypes.wizards][1]);
      const card4 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][4]);
      const card5 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][5]);
      const cards = [card1, card2, card3, card4, card5];
      expect(getCardsExceptCards(cards, [card1, card2])).toEqual([card3, card4, card5]);
      expect(getCardsExceptCards(cards, [card1, card3])).toEqual([card2, card4, card5]);
      expect(getCardsExceptCards(cards, [card2, card4])).toEqual([card1, card3, card5]);
      expect(getCardsExceptCards(cards, [])).toEqual(cards);
      expect(getCardsExceptCards(cards, cards)).toEqual([]);
    });
  });

  describe('getLastElement', () => {
    test('Корректно возвращает значения', () => {
      const card1 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][1]);
      const card3 = testHelper.createMockCard(undefined, cardMap[ECardTypes.wizards][1]);
      const cards = [card1, card2, card3];
      expect(getLastElement(cards)).toEqual(card3);
      expect(getLastElement([])).toBeUndefined();
    });
  });

  describe('getSkullsExceptSkulls', () => {
    test('Корректно возвращает значения', () => {
      const skull1 = testHelper.createMockSkull({ id: 1 });
      const skull2 = testHelper.createMockSkull({ id: 1 });
      const skull3 = testHelper.createMockSkull({ id: 1 });
      const skull4 = testHelper.createMockSkull({ id: 1 });
      const skull5 = testHelper.createMockSkull({ id: 1 });
      const skulls = [skull1, skull2, skull3, skull4, skull5];
      expect(getSkullsExceptSkulls(skulls, [skull1, skull2])).toEqual([skull3, skull4, skull5]);
      expect(getSkullsExceptSkulls(skulls, [skull1, skull3])).toEqual([skull2, skull4, skull5]);
      expect(getSkullsExceptSkulls(skulls, [skull2, skull4])).toEqual([skull1, skull3, skull5]);
      expect(getSkullsExceptSkulls(skulls, [])).toEqual(skulls);
      expect(getSkullsExceptSkulls(skulls, skulls)).toEqual([]);
    });
  });

  describe('getPropsExceptProps', () => {
    test('Корректно возвращает значения', () => {
      const prop1 = testHelper.createMockProp(propMap[1]);
      const prop2 = testHelper.createMockProp(propMap[2]);
      const prop3 = testHelper.createMockProp(propMap[3]);
      const prop4 = testHelper.createMockProp(propMap[4]);
      const prop5 = testHelper.createMockProp(propMap[5]);
      const props = [prop1, prop2, prop3, prop4, prop5];
      expect(getPropsExceptProps(props, [prop1, prop2])).toEqual([prop3, prop4, prop5]);
      expect(getPropsExceptProps(props, [prop1, prop3])).toEqual([prop2, prop4, prop5]);
      expect(getPropsExceptProps(props, [prop2, prop4])).toEqual([prop1, prop3, prop5]);
      expect(getPropsExceptProps(props, [])).toEqual(props);
      expect(getPropsExceptProps(props, props)).toEqual([]);
    });
  });

  describe('sleep', () => {
    test('Резолвится с задержкой', async () => {
      await sleep(100);
      expect(true).toBeTruthy();
    });
  });

  describe('toPlayerVariant', () => {
    test('Корректно возвращает значения', () => {
      const activePlayer = testHelper.createMockPlayer({ nickname: 'activePlayer' });
      expect(toPlayerVariant(activePlayer)).toEqual({ id: 'activePlayer', value: 'activePlayer' });
    });
  });

  describe('getCardsInFromClient', () => {
    test('Корректно возвращает значения', () => {
      const card1 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][1]);
      const card3 = testHelper.createMockCard(undefined, cardMap[ECardTypes.wizards][1]);
      const card4 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][4]);
      const cards = [card1, card2, card3, card4];
      expect(getCardsInFromClient([card1.format(), card2.format()], cards)).toEqual([card1, card2]);
      expect(getCardsInFromClient([card1.format()], cards)).toEqual([card1]);
      expect(getCardsInFromClient([card1.format()], [])).toEqual([]);
      expect(getCardsInFromClient([], cards)).toEqual([]);
    });
  });

  describe('getPropsInFromClient', () => {
    test('Корректно возвращает значения', () => {
      const prop1 = testHelper.createMockProp(propMap[1]);
      const prop2 = testHelper.createMockProp(propMap[2]);
      const prop3 = testHelper.createMockProp(propMap[3]);
      const prop4 = testHelper.createMockProp(propMap[4]);
      const props = [prop1, prop2, prop3, prop4];
      expect(getPropsInFromClient([prop1.format(), prop2.format()], props)).toEqual([prop1, prop2]);
      expect(getPropsInFromClient([prop1.format()], props)).toEqual([prop1]);
      expect(getPropsInFromClient([prop1.format()], [])).toEqual([]);
      expect(getPropsInFromClient([], props)).toEqual([]);
    });
  });

  describe('getSkullsInFromClient', () => {
    test('Корректно возвращает значения', () => {
      const skull1 = testHelper.createMockSkull({ id: 1 });
      const skull2 = testHelper.createMockSkull({ id: 2 });
      const skull3 = testHelper.createMockSkull({ id: 3 });
      const skull4 = testHelper.createMockSkull({ id: 4 });
      const skulls = [skull1, skull2, skull3, skull4];
      expect(getSkullsInFromClient([skull1.format(), skull2.format()], skulls)).toEqual([skull1, skull2]);
      expect(getSkullsInFromClient([skull1.format()], skulls)).toEqual([skull1]);
      expect(getSkullsInFromClient([skull1.format()], [])).toEqual([]);
      expect(getSkullsInFromClient([], skulls)).toEqual([]);
    });
  });

  describe('getCardInFromClient', () => {
    test('Корректно возвращает значения', () => {
      const card1 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][1]);
      const card3 = testHelper.createMockCard(undefined, cardMap[ECardTypes.wizards][1]);
      const cards = [card1, card2, card3];
      expect(getCardInFromClient(card1.format(), cards)).toEqual(card1);
      expect(getCardInFromClient(card1.format(), [])).toBeUndefined();
    });
  });

  describe('getPropInFromClient', () => {
    test('Корректно возвращает значения', () => {
      const prop1 = testHelper.createMockProp(propMap[1]);
      const prop2 = testHelper.createMockProp(propMap[2]);
      const prop3 = testHelper.createMockProp(propMap[3]);
      const props = [prop1, prop2, prop3];
      expect(getPropInFromClient(prop1.format(), props)).toEqual(prop1);
      expect(getPropInFromClient(prop1.format(), [])).toBeUndefined();
    });
  });

  describe('getSkullInFromClient', () => {
    test('Корректно возвращает значения', () => {
      const skull1 = testHelper.createMockSkull({ id: 1 });
      const skull2 = testHelper.createMockSkull({ id: 2 });
      const skull3 = testHelper.createMockSkull({ id: 3 });
      const skulls = [skull1, skull2, skull3];
      expect(getSkullInFromClient(skull1.format(), skulls)).toEqual(skull1);
      expect(getSkullInFromClient(skull1.format(), [])).toBeUndefined();
    });
  });

  describe('getMinHpPlayers', () => {
    test('Корректно возвращает значения', () => {
      const activePlayer = testHelper.createMockPlayer({ nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ nickname: 'otherPlayer' });
      const players = [activePlayer, otherPlayer];
      expect(getMinHpPlayers(players)).toEqual(players);
      otherPlayer.hp = 13;
      expect(getMinHpPlayers(players)).toEqual([otherPlayer]);
    });
  });

  describe('getMaxHpPlayers', () => {
    test('Корректно возвращает значения', () => {
      const activePlayer = testHelper.createMockPlayer({ nickname: 'activePlayer' });
      const otherPlayer = testHelper.createMockPlayer({ nickname: 'otherPlayer' });
      const players = [activePlayer, otherPlayer];
      expect(getMaxHpPlayers(players)).toEqual(players);
      otherPlayer.hp = 13;
      expect(getMaxHpPlayers(players)).toEqual([activePlayer]);
    });
  });

  describe('getMaxCostCards', () => {
    test('Корректно возвращает значения', () => {
      const activePlayer = testHelper.createMockPlayer({ nickname: 'activePlayer' });
      const card1 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][1]); // 4
      const card2 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][2]); // 5
      const card3 = testHelper.createMockCard(undefined, cardMap[ECardTypes.wizards][2]); // 5
      const cards = [card1, card2, card3];
      expect(getMaxCostCards(cards, activePlayer)).toEqual([card2, card3]);
      expect(getMaxCostCards([], activePlayer)).toEqual([]);
    });
  });

  describe('getMinCostCards', () => {
    test('Корректно возвращает значения', () => {
      const activePlayer = testHelper.createMockPlayer({ nickname: 'activePlayer' });
      const card1 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][1]); // 4
      const card2 = testHelper.createMockCard(undefined, cardMap[ECardTypes.creatures][1]); // 4
      const card3 = testHelper.createMockCard(undefined, cardMap[ECardTypes.wizards][2]); // 5
      const cards = [card1, card2, card3];
      expect(getMinCostCards(cards, activePlayer)).toEqual([card1, card2]);
      expect(getMinCostCards([], activePlayer)).toEqual([]);
    });
  });
});
