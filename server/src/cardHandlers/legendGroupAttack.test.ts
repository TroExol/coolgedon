import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';

import spyOn = jest.spyOn;

describe('legendGroupAttack', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
  });

  describe('legend 2', () => {
    let legend: Card;

    beforeEach(() => {
      legend = testHelper.createMockCard(room, cardMap[ECardTypes.legends][2]);
    });

    test('Разыгрывается', async () => {
      const card = getLastElement(otherPlayer.hand)!;

      spyOn(activePlayer, 'guard').mockResolvedValue(false);
      spyOn(otherPlayer, 'selectLeftUniqueCardTypes').mockResolvedValue([card]);

      await legend.play({ type: 'groupAttack' });

      expect(legend.played).toBeFalsy();
      expect(otherPlayer.hand.length).toBe(1);
      expect(otherPlayer.hand[0].id).toBe(card.id);
      expect(activePlayer.hand.length).toBe(5);
      expect(activePlayer.totalPower).toBe(0);
    });

    test('Не разыгрывается, если нет карт', async () => {
      otherPlayer.hand = [];
      activePlayer.hand = [];

      await legend.play({ type: 'groupAttack' });

      expect(legend.played).toBeFalsy();
      expect(otherPlayer.hand.length).toBe(0);
      expect(activePlayer.hand.length).toBe(0);
      expect(activePlayer.totalPower).toBe(0);
    });
  });

  describe('legend 3', () => {
    let legend: Card;

    beforeEach(() => {
      legend = testHelper.createMockCard(room, cardMap[ECardTypes.legends][3]);
    });

    test('Разыгрывается', async () => {
      spyOn(activePlayer, 'guard').mockResolvedValue(false);

      await legend.play({ type: 'groupAttack' });

      expect(legend.played).toBeFalsy();
      expect(activePlayer.hp).toBe(20);
      expect(activePlayer.discard.length).toBe(0);
      expect(otherPlayer.hp).toBe(15);
      expect(otherPlayer.discard.length).toBe(1);
      expect(otherPlayer.discard[0].type).toBe(ECardTypes.sluggishStick);
      expect(activePlayer.totalPower).toBe(0);
    });

    test('Не добавляет палку, если их нет', async () => {
      room.sluggishStick = [];

      spyOn(activePlayer, 'guard').mockResolvedValue(false);

      await legend.play({ type: 'groupAttack' });

      expect(legend.played).toBeFalsy();
      expect(activePlayer.hp).toBe(20);
      expect(activePlayer.discard.length).toBe(0);
      expect(otherPlayer.hp).toBe(15);
      expect(otherPlayer.discard.length).toBe(0);
      expect(activePlayer.totalPower).toBe(0);
    });
  });

  describe('legend 4', () => {
    let legend: Card;

    beforeEach(() => {
      legend = testHelper.createMockCard(room, cardMap[ECardTypes.legends][4]);
    });

    test('Разыгрывается', async () => {
      activePlayer.hand.push(
        testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]), // cost 4
        testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]), // cost 5
      );
      otherPlayer.hand.push(
        testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]), // cost 4
        testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]), // cost 5
      );

      spyOn(activePlayer, 'guard').mockResolvedValue(false);

      await legend.play({ type: 'groupAttack' });

      expect(legend.played).toBeFalsy();
      expect(activePlayer.hp).toBe(20);
      expect(activePlayer.discard.length).toBe(0);
      expect(otherPlayer.hp).toBe(20);
      expect(otherPlayer.discard.length).toBe(2);
      expect(otherPlayer.discard[0].type).toBe(ECardTypes.sluggishStick);
      expect(otherPlayer.discard[1].type).toBe(ECardTypes.sluggishStick);
      expect(activePlayer.totalPower).toBe(0);
    });

    test('Разыгрывается и не добавляет палки', async () => {
      spyOn(activePlayer, 'guard').mockResolvedValue(false);

      await legend.play({ type: 'groupAttack' });

      expect(legend.played).toBeFalsy();
      expect(activePlayer.hp).toBe(20);
      expect(activePlayer.discard.length).toBe(0);
      expect(otherPlayer.hp).toBe(20);
      expect(otherPlayer.discard.length).toBe(0);
      expect(activePlayer.totalPower).toBe(0);
    });

    test('Не добавляет палки, если их нет', async () => {
      otherPlayer.hand.push(
        testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]), // cost 4
        testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]), // cost 5
      );
      room.sluggishStick = [];

      spyOn(activePlayer, 'guard').mockResolvedValue(false);

      await legend.play({ type: 'groupAttack' });

      expect(legend.played).toBeFalsy();
      expect(activePlayer.hp).toBe(20);
      expect(activePlayer.discard.length).toBe(0);
      expect(otherPlayer.hp).toBe(20);
      expect(otherPlayer.discard.length).toBe(0);
      expect(activePlayer.totalPower).toBe(0);
    });
  });

  describe('legend 5', () => {
    let legend: Card;

    beforeEach(() => {
      legend = testHelper.createMockCard(room, cardMap[ECardTypes.legends][5]);
    });

    test('Разыгрывается', async () => {
      activePlayer.hand.push(
        testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]), // vp 1
        testHelper.createMockCard(room, cardMap[ECardTypes.creatures][10]), // vp 2
      );
      otherPlayer.hand.push(
        testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]), // cost 4
        testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]), // cost 5
      );

      spyOn(activePlayer, 'guard').mockResolvedValue(false);

      await legend.play({ type: 'groupAttack' });

      expect(legend.played).toBeFalsy();
      expect(activePlayer.hp).toBe(20);
      expect(otherPlayer.hp).toBe(14);
      expect(activePlayer.totalPower).toBe(0);
    });

    test('Разыгрывается и не добавляет палки', async () => {
      activePlayer.hand.push(
        testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]), // vp 1
        testHelper.createMockCard(room, cardMap[ECardTypes.creatures][10]), // vp 2
      );

      await legend.play({ type: 'groupAttack' });

      expect(legend.played).toBeFalsy();
      expect(activePlayer.hp).toBe(14);
      expect(otherPlayer.hp).toBe(20);
      expect(activePlayer.totalPower).toBe(0);
    });
  });

  describe('legend 7', () => {
    let legend: Card;

    beforeEach(() => {
      legend = testHelper.createMockCard(room, cardMap[ECardTypes.legends][7]);
    });

    test('Разыгрывается', async () => {
      spyOn(activePlayer, 'guard').mockResolvedValue(false);

      await legend.play({ type: 'groupAttack' });

      expect(legend.played).toBeFalsy();
      expect(activePlayer.hp).toBe(20);
      expect(otherPlayer.hp).toBe(13);
      expect(activePlayer.totalPower).toBe(0);
    });
  });

  describe('legend 8', () => {
    let legend: Card;

    beforeEach(() => {
      legend = testHelper.createMockCard(room, cardMap[ECardTypes.legends][8]);
    });

    test('Разыгрывается', async () => {
      const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
      otherPlayer.deck.push(card1, card2);
      activePlayer.deck.push(card1, card2);

      spyOn(activePlayer, 'guard').mockResolvedValue(false);

      await legend.play({ type: 'groupAttack' });

      expect(legend.played).toBeFalsy();
      expect(activePlayer.deck.length).toBe(7);
      expect(otherPlayer.deck.length).toBe(5);
      expect(activePlayer.discard.length).toBe(0);
      expect(otherPlayer.discard.length).toBe(2);
      expect(otherPlayer.discard.includes(card1)).toBeTruthy();
      expect(otherPlayer.discard.includes(card2)).toBeTruthy();
      expect(activePlayer.totalPower).toBe(0);
    });

    test('Не сбрасывает, если нечего', async () => {
      await legend.play({ type: 'groupAttack' });

      expect(legend.played).toBeFalsy();
      expect(activePlayer.deck.length).toBe(5);
      expect(otherPlayer.deck.length).toBe(5);
      expect(activePlayer.discard.length).toBe(0);
      expect(otherPlayer.discard.length).toBe(0);
      expect(activePlayer.totalPower).toBe(0);
    });
  });

  describe('legend 10', () => {
    let legend: Card;

    beforeEach(() => {
      legend = testHelper.createMockCard(room, cardMap[ECardTypes.legends][10]);
    });

    test('Разыгрывается', async () => {
      const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
      const card3 = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][2]);
      room.shop[0] = card1;
      room.shop[1] = card2;
      room.shop[2] = card3;
      room.shop[3] = card3;
      room.shop[4] = card3;

      spyOn(activePlayer, 'guard').mockResolvedValue(false);

      await legend.play({ type: 'groupAttack' });

      expect(legend.played).toBeFalsy();
      expect(activePlayer.discard.length).toBe(0);
      expect(otherPlayer.discard.length).toBe(2);
      expect(otherPlayer.discard[0].type).toBe(ECardTypes.sluggishStick);
      expect(otherPlayer.discard[1].type).toBe(ECardTypes.sluggishStick);
      expect(activePlayer.totalPower).toBe(0);
    });

    test('Не получает палки, если их нет', async () => {
      const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
      room.shop[0] = card1;
      room.shop[1] = card2;
      room.sluggishStick = [];

      await legend.play({ type: 'groupAttack' });

      expect(legend.played).toBeFalsy();
      expect(activePlayer.discard.length).toBe(0);
      expect(otherPlayer.discard.length).toBe(0);
      expect(activePlayer.totalPower).toBe(0);
    });
  });

  describe('legend 11', () => {
    let legend: Card;

    beforeEach(() => {
      legend = testHelper.createMockCard(room, cardMap[ECardTypes.legends][11]);
    });

    test('Разыгрывается', async () => {
      const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]); // cost 4
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]); // cost 5
      otherPlayer.hand.push(card1, card2);
      activePlayer.hand.push(card1, card2);

      spyOn(activePlayer, 'guard').mockResolvedValue(false);

      await legend.play({ type: 'groupAttack' });

      expect(legend.played).toBeFalsy();
      expect(activePlayer.hand.length).toBe(7);
      expect(otherPlayer.hand.length).toBe(6);
      expect(activePlayer.discard.length).toBe(0);
      expect(otherPlayer.discard.length).toBe(1);
      expect(otherPlayer.hand.includes(card1)).toBeTruthy();
      expect(otherPlayer.discard.includes(card1)).toBeFalsy();
      expect(otherPlayer.discard.includes(card2)).toBeTruthy();
      expect(activePlayer.totalPower).toBe(0);
    });

    test('Не сбрасывает, если нечего', async () => {
      await legend.play({ type: 'groupAttack' });

      expect(legend.played).toBeFalsy();
      expect(activePlayer.hand.length).toBe(5);
      expect(otherPlayer.hand.length).toBe(5);
      expect(activePlayer.discard.length).toBe(0);
      expect(otherPlayer.discard.length).toBe(0);
      expect(activePlayer.totalPower).toBe(0);
    });
  });

  describe('legend 12', () => {
    let legend: Card;

    beforeEach(() => {
      legend = testHelper.createMockCard(room, cardMap[ECardTypes.legends][12]);
    });

    test('Разыгрывается', async () => {
      otherPlayer.hp = 12;

      await legend.play({ type: 'groupAttack' });

      expect(legend.played).toBeFalsy();
      expect(activePlayer.hp).toBe(12);
      expect(otherPlayer.hp).toBe(12);
      expect(activePlayer.totalPower).toBe(0);
    });

    test('Разыгрывается, если хп одинаковое', async () => {
      otherPlayer.hp = 12;
      activePlayer.hp = 12;

      await legend.play({ type: 'groupAttack' });

      expect(legend.played).toBeFalsy();
      expect(activePlayer.hp).toBe(12);
      expect(otherPlayer.hp).toBe(12);
      expect(activePlayer.totalPower).toBe(0);
    });

    test('Защищается', async () => {
      otherPlayer.hp = 12;

      spyOn(activePlayer, 'guard').mockResolvedValue(false);

      await legend.play({ type: 'groupAttack' });

      expect(legend.played).toBeFalsy();
      expect(activePlayer.hp).toBe(20);
      expect(otherPlayer.hp).toBe(12);
      expect(activePlayer.totalPower).toBe(0);
    });
  });
});
