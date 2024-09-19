import { cardMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';

import * as testHelper from 'Helpers/tests';
import * as playGuardEvent from 'Event/playGuard';
import { Prop } from 'Entity/prop';
import { Card } from 'Entity/card';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('Card', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = testHelper.consoleErrorMockSpy();
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
  });

  test('instance имеет дефолтные значения', () => {
    const room = testHelper.createMockRoom('1', 'player');
    const card = new Card({
      room,
      id: 1,
      type: ECardTypes.familiars,
      number: 1,
      victoryPoints: 2,
      power: 2,
      cost: 6,
      playable: true,
      canGuard: true,
      permanent: false,
    });

    expect(card.id).toBe(1);
    expect(card.type).toBe(ECardTypes.familiars);
    expect(card.power).toBe(2);
    expect(card.number).toBe(1);
    expect(card.canGuard).toBeTruthy();
    expect(card.played).toBeFalsy();
    expect(card.playing).toBeFalsy();
    expect(card.permanent).toBeFalsy();
    expect(card.tempOwnerNickname).toBeUndefined();
    expect(card.ownerNickname).toBeUndefined();
    expect(card.data).toBeUndefined();
  });

  describe('activate', () => {
    test('Активируется постоянка', () => {
      const room = testHelper.createMockRoom('1', 'player');
      const player = testHelper.createMockPlayer({ room, nickname: 'player' });
      testHelper.addPlayerToRoom(room, player);
      testHelper.addPlayerToRoom(room, player);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.places][1]);
      testHelper.giveCardToPlayer(card, player);

      spyOn(card, 'play').mockImplementation(async () => {});
      spyOn(room, 'sendInfo').mockImplementation(fn());
      spyOn(room, 'logEvent').mockImplementation(fn());

      card.activate();
      expect(card.play).toHaveBeenCalled();
      expect(player.hand.indexOf(card)).toBe(-1);
      expect(player.activePermanent.indexOf(card)).not.toBe(-1);
      expect(room.sendInfo).toHaveBeenCalled();
      expect(room.logEvent).toHaveBeenCalledWith('Игрок player активировал постоянку');
    });

    test('Активируется постоянка и поменяется владелец', () => {
      const room = testHelper.createMockRoom('1', 'player');
      const player = testHelper.createMockPlayer({ room, nickname: 'player' });
      const player2 = testHelper.createMockPlayer({ room, nickname: 'player2' });
      testHelper.addPlayerToRoom(room, player);
      testHelper.addPlayerToRoom(room, player2);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.places][1]);
      testHelper.giveCardToPlayer(card, player);
      card.ownerNickname = 'player2';
      card.tempOwnerNickname = 'player';

      spyOn(card, 'play').mockImplementation(async () => {});
      spyOn(room, 'sendInfo').mockImplementation(fn());
      spyOn(room, 'logEvent').mockImplementation(fn());

      card.activate();
      expect(card.play).toHaveBeenCalled();
      expect(card.tempOwnerNickname).toBeUndefined();
      expect(card.ownerNickname).toBe('player');
      expect(player.activePermanent.indexOf(card)).not.toBe(-1);
      expect(room.sendInfo).toHaveBeenCalled();
      expect(room.logEvent).toHaveBeenCalledWith('Игрок player активировал постоянку');
    });

    test('Нельзя активировать постоянку без owner', () => {
      const room = testHelper.createMockRoom('1', 'player');
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.places][1]);

      card.activate();
      expect(console.error).toHaveBeenCalledWith('Невозможно активировать постоянку: нет владельца');
    });

    test('Нельзя активировать постоянку для owner != активного игрока', () => {
      const room = testHelper.createMockRoom('1', 'player1');
      const player1 = testHelper.createMockPlayer({ room, nickname: 'player1' });
      const player2 = testHelper.createMockPlayer({ room, nickname: 'player2' });
      testHelper.addPlayerToRoom(room, player1);
      testHelper.addPlayerToRoom(room, player2);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.places][1]);
      testHelper.giveCardToPlayer(card, player2);

      card.activate();
      expect(console.error).toHaveBeenCalledWith('Невозможно активировать постоянку: владелец не активный игрок');
    });

    test('Нельзя активировать не постоянку', () => {
      const room = testHelper.createMockRoom('1', 'player');
      const player = testHelper.createMockPlayer({ room, nickname: 'player' });
      testHelper.addPlayerToRoom(room, player);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      testHelper.giveCardToPlayer(card, player);

      card.activate();
      expect(console.error).toHaveBeenCalledWith('Невозможно активировать не постоянку');
    });
  });

  describe('canPlay', () => {
    describe('Должен возвращать правильное значение', () => {
      let room: Room;
      let activePlayer: Player;
      let otherPlayer: Player;

      beforeEach(() => {
        room = testHelper.createMockRoom('1', 'activePlayer');
        activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
        otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
        testHelper.addPlayerToRoom(room, activePlayer);
        testHelper.addPlayerToRoom(room, otherPlayer);
      });

      describe('lawlessness 1', () => {
        let lawlessness: Card;

        beforeEach(() => {
          lawlessness = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][1]);
        });

        test('При наличии текущей легенды', () => {
          expect(lawlessness.canPlay()).toBe(true);
        });

        test('При отсутствии текущей легенды', () => {
          const legends = [...room.legends];
          room.legends = [];

          expect(lawlessness.canPlay()).toBe(false);

          room.legends = legends;
        });
      });

      describe('lawlessness 2', () => {
        let lawlessness: Card;

        beforeEach(() => {
          lawlessness = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][2]);
        });

        test('С игроком hp >= 10', () => {
          activePlayer.hp = 10;
          otherPlayer.hp = 10;

          expect(lawlessness.canPlay()).toBe(true);

          activePlayer.hp = 20;
          otherPlayer.hp = 20;
        });

        test('Без игроков hp >= 10', () => {
          activePlayer.hp = 9;
          otherPlayer.hp = 9;

          expect(lawlessness.canPlay()).toBe(false);

          activePlayer.hp = 20;
          otherPlayer.hp = 20;
        });
      });

      // describe('lawlessness 3', () => {
      //   test('С картой на барахолке, которая может атаковать', () => {
      //     const card = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][3]);
      //     room.shop[0] = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][6]);
      //     expect(card.canPlay()).toBe(true);
      //   });
      //
      //   test('Без карты на барахолке, которая может атаковать', () => {
      //     const card = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][3]);
      //     const shop = [...room.shop];
      //     room.shop = [];
      //     expect(card.canPlay()).toBe(false);
      //     room.shop = shop;
      //   });
      // });

      describe('lawlessness 4', () => {
        let lawlessness: Card;

        beforeEach(() => {
          lawlessness = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][4]);
        });

        test('С рукой и шальной магией', () => {
          expect(lawlessness.canPlay()).toBe(true);
        });

        test('Без руки, с шальной магией', () => {
          const activePlayerHand = [...activePlayer.hand];
          const otherPlayerHand = [...otherPlayer.hand];
          activePlayer.hand = [];
          otherPlayer.hand = [];

          expect(lawlessness.canPlay()).toBe(true);

          activePlayer.hand = activePlayerHand;
          otherPlayer.hand = otherPlayerHand;
        });

        test('Без руки, без шальной магией', () => {
          const activePlayerHand = [...activePlayer.hand];
          const otherPlayerHand = [...otherPlayer.hand];
          const crazyMagic = [...room.crazyMagic];
          activePlayer.hand = [];
          otherPlayer.hand = [];
          room.crazyMagic = [];

          expect(lawlessness.canPlay()).toBe(true);

          activePlayer.hand = activePlayerHand;
          otherPlayer.hand = otherPlayerHand;
          room.crazyMagic = crazyMagic;
        });
      });

      describe('lawlessness 5', () => {
        let lawlessness: Card;

        beforeEach(() => {
          lawlessness = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][5]);
        });

        test('С основной колодой', () => {
          expect(lawlessness.canPlay()).toBe(true);
        });

        test('Без основной колоды', () => {
          const deck = [...room.deck];
          room.deck = [];

          expect(lawlessness.canPlay()).toBe(false);

          room.deck = deck;
        });
      });

      describe('lawlessness 7', () => {
        let lawlessness: Card;

        beforeEach(() => {
          lawlessness = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][7]);
        });

        test('С колодой и сбросом', () => {
          activePlayer.discard = [testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1])];
          expect(lawlessness.canPlay()).toBe(true);
          activePlayer.discard = [];
        });

        test('С колодой и без сброса', () => {
          const activePlayerDiscard = [...activePlayer.discard];
          const otherPlayerDiscard = [...otherPlayer.discard];
          activePlayer.discard = [];
          otherPlayer.discard = [];

          expect(lawlessness.canPlay()).toBe(true);

          activePlayer.discard = activePlayerDiscard;
          otherPlayer.discard = otherPlayerDiscard;
        });

        test('Со сбросом и без колоды', () => {
          activePlayer.discard = [testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1])];
          const activePlayerDeck = [...activePlayer.deck];
          const otherPlayerDeck = [...otherPlayer.deck];
          activePlayer.deck = [];
          otherPlayer.deck = [];

          expect(lawlessness.canPlay()).toBe(true);

          activePlayer.deck = activePlayerDeck;
          otherPlayer.deck = otherPlayerDeck;
          activePlayer.discard = [];
        });

        test('Без сброса и без колоды', () => {
          const activePlayerDeck = [...activePlayer.deck];
          const otherPlayerDeck = [...otherPlayer.deck];
          const activePlayerDiscard = [...activePlayer.discard];
          const otherPlayerDiscard = [...otherPlayer.discard];
          activePlayer.deck = [];
          otherPlayer.deck = [];
          activePlayer.discard = [];
          otherPlayer.discard = [];

          expect(lawlessness.canPlay()).toBe(false);

          activePlayer.deck = activePlayerDeck;
          otherPlayer.deck = otherPlayerDeck;
          activePlayer.discard = activePlayerDiscard;
          otherPlayer.discard = otherPlayerDiscard;
        });
      });

      describe('lawlessness 8', () => {
        let lawlessness: Card;

        beforeEach(() => {
          lawlessness = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][8]);
        });

        test('С рукой и сбросом', () => {
          otherPlayer.discard = [testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1])];
          expect(lawlessness.canPlay()).toBe(true);
          otherPlayer.discard = [];
        });

        test('С рукой и без сброса', () => {
          const activePlayerDiscard = [...activePlayer.discard];
          const otherPlayerDiscard = [...otherPlayer.discard];
          activePlayer.discard = [];
          otherPlayer.discard = [];

          expect(lawlessness.canPlay()).toBe(true);

          activePlayer.discard = activePlayerDiscard;
          otherPlayer.discard = otherPlayerDiscard;
        });

        test('Со сбросом и без руки', () => {
          otherPlayer.discard = [testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1])];
          const activePlayerHand = [...activePlayer.hand];
          const otherPlayerHand = [...otherPlayer.hand];
          activePlayer.hand = [];
          otherPlayer.hand = [];

          expect(lawlessness.canPlay()).toBe(true);

          activePlayer.hand = activePlayerHand;
          otherPlayer.hand = otherPlayerHand;
          otherPlayer.discard = [];
        });

        test('Без сброса и без руки', () => {
          const activePlayerHand = [...activePlayer.hand];
          const otherPlayerHand = [...otherPlayer.hand];
          const activePlayerDiscard = [...activePlayer.discard];
          const otherPlayerDiscard = [...otherPlayer.discard];
          activePlayer.hand = [];
          otherPlayer.hand = [];
          activePlayer.discard = [];
          otherPlayer.discard = [];

          expect(lawlessness.canPlay()).toBe(false);

          activePlayer.hand = activePlayerHand;
          otherPlayer.hand = otherPlayerHand;
          activePlayer.discard = activePlayerDiscard;
          otherPlayer.discard = otherPlayerDiscard;
        });
      });

      describe('lawlessness 9', () => {
        let lawlessness: Card;

        beforeEach(() => {
          lawlessness = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][9]);
        });

        test('Возвращает true', () => {
          expect(lawlessness.canPlay()).toBe(true);
        });
      });

      describe('lawlessness 10', () => {
        let lawlessness: Card;

        beforeEach(() => {
          lawlessness = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][10]);
        });

        test('Возвращает true', () => {
          expect(lawlessness.canPlay()).toBe(true);
        });
      });

      describe('lawlessness 11', () => {
        let lawlessness: Card;

        beforeEach(() => {
          lawlessness = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][11]);
        });

        test('Возвращает true', () => {
          expect(lawlessness.canPlay()).toBe(true);
        });
      });
    });
  });

  describe('format', () => {
    test('format возвращает корректные значения', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const player = testHelper.createMockPlayer({ room, nickname: 'player' });
      testHelper.addPlayerToRoom(room, player);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      testHelper.giveCardToPlayer(card, player);

      expect(card.format()).toEqual({
        number: 1,
        ownerNickname: 'player',
        totalCost: undefined,
        id: card.id,
        canPlay: true,
        type: ECardTypes.creatures,
        data: undefined,
      });

      card.played = true;
      expect(card.format()).toEqual({
        number: 1,
        ownerNickname: 'player',
        totalCost: undefined,
        id: card.id,
        canPlay: false,
        type: ECardTypes.creatures,
        data: undefined,
      });

      card.played = false;

      expect(card.format(player)).toEqual({
        number: 1,
        ownerNickname: 'player',
        totalCost: 4,
        id: card.id,
        canPlay: true,
        type: ECardTypes.creatures,
        data: undefined,
      });

      player.skulls.push(testHelper.createMockSkull({ id: 19, room }));

      expect(card.format(player)).toEqual({
        number: 1,
        ownerNickname: 'player',
        totalCost: 5,
        id: card.id,
        canPlay: true,
        type: ECardTypes.creatures,
        data: undefined,
      });
      player.skulls.pop();
    });
  });

  describe('getFinalDamage', () => {
    describe('Должен возвращать правильное значение', () => {
      let room: Room;
      let activePlayer: Player;
      let otherPlayer: Player;

      beforeEach(() => {
        room = testHelper.createMockRoom('1', 'activePlayer');
        activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
        otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
        testHelper.addPlayerToRoom(room, activePlayer);
        testHelper.addPlayerToRoom(room, otherPlayer);
      });

      test('Должен возвращать concreteDamage', () => {
        const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);

        expect(card.getFinalDamage({ concreteDamage: 99, target: otherPlayer })).toBe(99);
      });

      describe('seeds 2', () => {
        let card: Card;

        beforeEach(() => {
          card = testHelper.createMockCard(room, cardMap[ECardTypes.seeds][2]);
        });

        test('Правильный урон', () => {
          expect(card.getFinalDamage({ target: otherPlayer })).toBe(1);
        });

        test('Правильный урон с жетоном на доп урон', () => {
          otherPlayer.skulls.push(testHelper.createMockSkull({ id: 16, room }));

          expect(card.getFinalDamage({ target: otherPlayer })).toBe(4);
        });
      });

      describe('creatures 1', () => {
        let card: Card;

        beforeEach(() => {
          card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
        });

        test('Правильный урон', () => {
          otherPlayer.hand.push(testHelper.createMockCard(room, cardMap[ECardTypes.familiars][1])); // cost 6

          expect(card.getFinalDamage({ target: otherPlayer })).toBe(6);
        });
      });

      describe('creatures 2', () => {
        let card: Card;

        beforeEach(() => {
          card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
        });

        test('Вялая пялочка в руке и сбросе', () => {
          activePlayer.hand.push(testHelper.createMockCard(room, cardMap[ECardTypes.sluggishStick]));
          activePlayer.discard.push(testHelper.createMockCard(room, cardMap[ECardTypes.sluggishStick]));
          expect(card.getFinalDamage({ target: otherPlayer, attacker: activePlayer })).toBe(4);
        });

        test('Без вялых пялочек', () => {
          expect(card.getFinalDamage({ target: otherPlayer, attacker: activePlayer })).toBe(0);
        });
      });

      test('creatures 6', () => {
        const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][6]);
        expect(card.getFinalDamage({ target: otherPlayer })).toBe(4);
      });

      describe('creatures 12', () => {
        let card: Card;

        beforeEach(() => {
          card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][12]);
        });

        test('С 2-умя постоянками', () => {
          activePlayer.activePermanent.push(testHelper.createMockCard(room, cardMap[ECardTypes.places][1]));
          activePlayer.activePermanent.push(testHelper.createMockCard(room, cardMap[ECardTypes.places][2]));
          expect(card.getFinalDamage({ target: otherPlayer, attacker: activePlayer })).toBe(6);
        });

        test('Без постоянок', () => {
          expect(card.getFinalDamage({ target: otherPlayer, attacker: activePlayer })).toBe(0);
        });
      });

      test('familiars 4', () => {
        const card = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][4]);
        expect(card.getFinalDamage({ target: otherPlayer })).toBe(7);
      });

      describe('familiars 10', () => {
        let card: Card;

        beforeEach(() => {
          card = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][10]);
        });

        test('С тварью в руке и сбросе', () => {
          activePlayer.hand.push(testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]));
          activePlayer.discard.push(testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]));

          expect(card.getFinalDamage({ target: otherPlayer, attacker: activePlayer })).toBe(4);
        });

        test('Без тварей', () => {
          expect(card.getFinalDamage({ target: otherPlayer, attacker: activePlayer })).toBe(0);
        });
      });

      describe('familiars 12', () => {
        let card: Card;

        beforeEach(() => {
          card = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][12]);
        });

        test('С волшебником в руке и сбросе', () => {
          activePlayer.hand.push(testHelper.createMockCard(room, cardMap[ECardTypes.wizards][1]));
          activePlayer.discard.push(testHelper.createMockCard(room, cardMap[ECardTypes.wizards][2]));

          expect(card.getFinalDamage({ target: otherPlayer, attacker: activePlayer })).toBe(4);
        });

        test('Без волшебников', () => {
          expect(card.getFinalDamage({ target: otherPlayer, attacker: activePlayer })).toBe(0);
        });
      });

      test('legends 4', () => {
        const card = testHelper.createMockCard(room, cardMap[ECardTypes.legends][4]);
        expect(card.getFinalDamage({ target: otherPlayer })).toBe(4);
      });

      describe('treasures 1', () => {
        let card: Card;

        beforeEach(() => {
          card = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][1]);
        });

        test('С легендами', () => {
          otherPlayer.discard.push(testHelper.createMockCard(room, cardMap[ECardTypes.legends][1]));
          otherPlayer.discard.push(testHelper.createMockCard(room, cardMap[ECardTypes.legends][2]));

          expect(card.getFinalDamage({ target: otherPlayer })).toBe(8);
        });

        test('Без легенд', () => {
          expect(card.getFinalDamage({ target: otherPlayer })).toBe(0);
        });
      });

      test('treasures 4', () => {
        const card = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][4]);
        expect(card.getFinalDamage({ target: otherPlayer })).toBe(5);
      });

      test('treasures 7', () => {
        const card = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][7]);
        expect(card.getFinalDamage({ target: otherPlayer })).toBe(3);
      });

      test('wizards 1', () => {
        const card = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][1]);
        expect(card.getFinalDamage({ target: otherPlayer })).toBe(10);
      });

      test('wizards 3', () => {
        const card = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][3]);
        expect(card.getFinalDamage({ target: otherPlayer })).toBe(5);
      });

      describe('wizards 6', () => {
        let card: Card;

        beforeEach(() => {
          card = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][6]);
        });

        test('С колодой', () => {
          otherPlayer.deck.push(testHelper.createMockCard(room, cardMap[ECardTypes.legends][1])); // cost 8

          expect(card.getFinalDamage({ target: otherPlayer })).toBe(8);
        });

        test('Без колоды', () => {
          otherPlayer.deck = [];
          expect(card.getFinalDamage({ target: otherPlayer })).toBe(0);
        });
      });

      test('wizards 11', () => {
        const card = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][11]);
        expect(card.getFinalDamage({ target: otherPlayer })).toBe(5);
      });

      test('spells 4', () => {
        const card = testHelper.createMockCard(room, cardMap[ECardTypes.spells][4]);
        expect(card.getFinalDamage({ target: otherPlayer })).toBe(5);
      });

      test('spells 8', () => {
        const card = testHelper.createMockCard(room, cardMap[ECardTypes.spells][8]);
        expect(card.getFinalDamage({ target: otherPlayer })).toBe(6);
      });

      describe('spells 10', () => {
        let card: Card;

        beforeEach(() => {
          card = testHelper.createMockCard(room, cardMap[ECardTypes.spells][10]);
        });

        test('С защитой в сбросе', () => {
          otherPlayer.discard.push(testHelper.createMockCard(room, cardMap[ECardTypes.familiars][1]));
          otherPlayer.discard.push(testHelper.createMockCard(room, cardMap[ECardTypes.familiars][2]));

          expect(card.getFinalDamage({ target: otherPlayer })).toBe(4);
        });

        test('Без защиты', () => {
          expect(card.getFinalDamage({ target: otherPlayer })).toBe(0);
        });
      });

      test('spells 13', () => {
        const card = testHelper.createMockCard(room, cardMap[ECardTypes.spells][13]);
        expect(card.getFinalDamage({ target: otherPlayer })).toBe(7);
      });
    });
  });

  describe('getTotalCost', () => {
    let room: Room;
    let activePlayer: Player;

    beforeEach(() => {
      room = testHelper.createMockRoom('1', 'activePlayer');
      activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
    });

    test('Без модификаторов', () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);

      expect(card.getTotalCost(activePlayer)).toBe(4);
    });

    test('С жетоном 18', () => {
      activePlayer.skulls.push(testHelper.createMockSkull({ room, id: 18 }));
      const creature = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const legend = testHelper.createMockCard(room, cardMap[ECardTypes.legends][1]);
      const crazyMagic = testHelper.createMockCard(room, cardMap[ECardTypes.crazyMagic]);

      expect(creature.getTotalCost(activePlayer)).toBe(4);
      expect(legend.getTotalCost(activePlayer)).toBe(9);
      expect(crazyMagic.getTotalCost(activePlayer)).toBe(4);
    });

    test('С жетоном 19', () => {
      activePlayer.skulls.push(testHelper.createMockSkull({ room, id: 19 }));
      const legend = testHelper.createMockCard(room, cardMap[ECardTypes.legends][1]);
      const creature = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const treasure = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][1]);

      expect(legend.getTotalCost(activePlayer)).toBe(8);
      expect(creature.getTotalCost(activePlayer)).toBe(5);
      expect(treasure.getTotalCost(activePlayer)).toBe(6);
    });

    test('С жетоном 20', () => {
      activePlayer.skulls.push(testHelper.createMockSkull({ room, id: 20 }));
      const legend = testHelper.createMockCard(room, cardMap[ECardTypes.legends][1]);
      const wizard = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][1]);
      const spell = testHelper.createMockCard(room, cardMap[ECardTypes.spells][3]);

      expect(legend.getTotalCost(activePlayer)).toBe(8);
      expect(wizard.getTotalCost(activePlayer)).toBe(8);
      expect(spell.getTotalCost(activePlayer)).toBe(6);
    });
  });

  describe('getTotalVictoryPoints', () => {
    let room: Room;
    let activePlayer: Player;

    beforeEach(() => {
      room = testHelper.createMockRoom('1', 'activePlayer');
      activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
    });

    test('Обычная карта', () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      expect(card.getTotalVictoryPoints(activePlayer)).toBe(1);
    });

    describe('treasures 2', () => {
      test('Имеется две treasures 2', () => {
        const card = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][2]);
        activePlayer.discard.push(card);
        activePlayer.discard.push(testHelper.createMockCard(room, cardMap[ECardTypes.treasures][2]));

        expect(card.getTotalVictoryPoints(activePlayer)).toBe(5);
      });

      test('Имеется одна treasures 2', () => {
        const card = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][2]);
        activePlayer.discard.push(card);

        expect(card.getTotalVictoryPoints(activePlayer)).toBe(0);
      });
    });

    describe('treasures 13', () => {
      test('Имеется две treasures 13', () => {
        const card = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][13]);
        activePlayer.activePermanent.push(card);
        activePlayer.activePermanent.push(testHelper.createMockCard(room, cardMap[ECardTypes.treasures][13]));

        expect(card.getTotalVictoryPoints(activePlayer)).toBe(0);
        activePlayer.skulls.push(testHelper.createMockSkull({ room, id: 18 }));
        activePlayer.skulls.push(testHelper.createMockSkull({ room, id: 18 }));
        expect(card.getTotalVictoryPoints(activePlayer)).toBe(0);
        room.gameEnded = true;
        expect(card.getTotalVictoryPoints(activePlayer)).toBe(2);
        expect(activePlayer.victoryPoints).toBe(-2);
      });

      test('Имеется одна treasures 13', () => {
        const card = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][13]);
        activePlayer.activePermanent.push(card);

        expect(card.getTotalVictoryPoints(activePlayer)).toBe(0);
        activePlayer.skulls.push(testHelper.createMockSkull({ room, id: 18 }));
        activePlayer.skulls.push(testHelper.createMockSkull({ room, id: 18 }));
        expect(card.getTotalVictoryPoints(activePlayer)).toBe(0);
        room.gameEnded = true;
        expect(card.getTotalVictoryPoints(activePlayer)).toBe(2);
      });
    });
  });

  describe('markAsPlayed', () => {
    let room: Room;
    let activePlayer: Player;

    beforeEach(() => {
      room = testHelper.createMockRoom('1', 'activePlayer');
      activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
      testHelper.addPlayerToRoom(room, activePlayer);
    });

    test('Пометить карту разыгранной', () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      testHelper.giveCardToPlayer(card, activePlayer);

      spyOn(room, 'sendInfo');
      spyOn(room, 'logEvent');

      card.markAsPlayed();
      expect(card.played).toBeTruthy();
      expect(room.onCurrentTurn.playedCards).toEqual({ [ECardTypes.creatures]: [card] });
      expect(room.sendInfo).toHaveBeenCalled();
      expect(room.logEvent).toHaveBeenCalledWith('Игрок activePlayer разыграл карту');
    });

    test('Нельзя разыгрывать разыгранную карту', () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      testHelper.giveCardToPlayer(card, activePlayer);
      card.played = true;

      spyOn(room, 'sendInfo');
      spyOn(room, 'logEvent');

      try {
        card.markAsPlayed();
      } catch (error) {
        expect(error).toEqual(new Error('Невозможно пометить карту разыгранной: карта была уже разыграна'));
      }
      expect(card.played).toBeTruthy();
      expect(room.onCurrentTurn.playedCards).toEqual({ });
      expect(room.sendInfo).toHaveBeenCalledTimes(0);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });

    test('Нельзя пометить карту разыгранной без владельца', () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      testHelper.giveCardToPlayer(card, activePlayer);
      card.ownerNickname = undefined;

      spyOn(room, 'sendInfo');
      spyOn(room, 'logEvent');

      try {
        card.markAsPlayed();
      } catch (error) {
        expect(error).toEqual(new Error('Невозможно пометить карту разыгранной: нет владельца'));
      }
      expect(card.played).toBeFalsy();
      expect(room.onCurrentTurn.playedCards).toEqual({ });
      expect(room.sendInfo).toHaveBeenCalledTimes(0);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });

    test('Нельзя пометить карту разыгранным для owner != активного игрока', () => {
      const otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer' });
      testHelper.addPlayerToRoom(room, otherPlayer);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      testHelper.giveCardToPlayer(card, otherPlayer);

      spyOn(room, 'sendInfo');
      spyOn(room, 'logEvent');

      try {
        card.markAsPlayed();
      } catch (error) {
        expect(error).toEqual(new Error('Невозможно пометить карту разыгранной: владелец не активный игрок'));
      }
      expect(card.played).toBeFalsy();
      expect(room.onCurrentTurn.playedCards).toEqual({ });
      expect(room.sendInfo).toHaveBeenCalledTimes(0);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });

    test('Нельзя пометить беспредел разыгранным', () => {
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][1]);
      testHelper.giveCardToPlayer(card, activePlayer);

      spyOn(room, 'sendInfo');
      spyOn(room, 'logEvent');

      try {
        card.markAsPlayed();
      } catch (error) {
        expect(error).toEqual(new Error('Невозможно пометить карту разыгранной: это беспредел'));
      }
      expect(card.played).toBeFalsy();
      expect(room.onCurrentTurn.playedCards).toEqual({ });
      expect(room.sendInfo).toHaveBeenCalledTimes(0);
      expect(room.logEvent).toHaveBeenCalledTimes(0);
    });

    describe('Разыгрываются постоянки', () => {
      let playSpy: jest.SpyInstance;

      beforeEach(() => {
        playSpy = spyOn(Card.prototype, 'play').mockImplementation(async () => {});
      });

      afterEach(() => {
        playSpy.mockRestore();
      });

      test('places 1', () => {
        activePlayer.activePermanent.push(testHelper.createMockCard(room, cardMap[ECardTypes.places][1]));
        const creature = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
        const wizard1 = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][1]);
        const wizard2 = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][2]);
        testHelper.giveCardToPlayer(creature, activePlayer);
        testHelper.giveCardToPlayer(wizard1, activePlayer);
        testHelper.giveCardToPlayer(wizard2, activePlayer);

        creature.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(0);
        wizard1.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(1);
        expect(playSpy.mock.instances[0].type).toBe(ECardTypes.places);
        expect(playSpy.mock.instances[0].number).toBe(1);
        wizard2.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(1);
      });

      test('places 2', () => {
        activePlayer.activePermanent.push(testHelper.createMockCard(room, cardMap[ECardTypes.places][2]));
        const wizard = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][1]);
        const creature1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
        const creature2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
        testHelper.giveCardToPlayer(wizard, activePlayer);
        testHelper.giveCardToPlayer(creature1, activePlayer);
        testHelper.giveCardToPlayer(creature2, activePlayer);

        wizard.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(0);
        creature1.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(1);
        expect(playSpy.mock.instances[0].type).toBe(ECardTypes.places);
        expect(playSpy.mock.instances[0].number).toBe(2);
        creature2.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(1);
      });

      test('places 3', () => {
        activePlayer.activePermanent.push(testHelper.createMockCard(room, cardMap[ECardTypes.places][3]));
        const wizard = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][1]);
        const spell1 = testHelper.createMockCard(room, cardMap[ECardTypes.spells][3]);
        const spell2 = testHelper.createMockCard(room, cardMap[ECardTypes.spells][4]);
        testHelper.giveCardToPlayer(wizard, activePlayer);
        testHelper.giveCardToPlayer(spell1, activePlayer);
        testHelper.giveCardToPlayer(spell2, activePlayer);

        wizard.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(0);
        spell1.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(1);
        expect(playSpy.mock.instances[0].type).toBe(ECardTypes.places);
        expect(playSpy.mock.instances[0].number).toBe(3);
        spell2.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(1);
      });

      test('places 4', () => {
        activePlayer.activePermanent.push(testHelper.createMockCard(room, cardMap[ECardTypes.places][4]));
        const wizard = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][1]);
        const treasure1 = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][1]);
        const treasure2 = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][2]);
        testHelper.giveCardToPlayer(wizard, activePlayer);
        testHelper.giveCardToPlayer(treasure1, activePlayer);
        testHelper.giveCardToPlayer(treasure2, activePlayer);

        wizard.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(0);
        treasure1.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(1);
        expect(playSpy.mock.instances[0].type).toBe(ECardTypes.places);
        expect(playSpy.mock.instances[0].number).toBe(4);
        treasure2.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('Разыгрываются свойства', () => {
      let playSpy: jest.SpyInstance;

      beforeEach(() => {
        playSpy = spyOn(Prop.prototype, 'play').mockImplementation(async () => {
        });
      });

      afterEach(() => {
        playSpy.mockRestore();
      });

      test('prop 1', () => {
        activePlayer.props = [];
        activePlayer.props.push(testHelper.createMockProp({ id: 1, room, playable: true }));
        const wizard = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][1]);
        const treasure1 = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][1]);
        const treasure2 = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][2]);
        const treasure3 = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][3]);
        testHelper.giveCardToPlayer(wizard, activePlayer);
        testHelper.giveCardToPlayer(treasure1, activePlayer);
        testHelper.giveCardToPlayer(treasure2, activePlayer);
        testHelper.giveCardToPlayer(treasure3, activePlayer);

        wizard.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(0);
        treasure1.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(0);
        treasure2.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(1);
        expect(playSpy.mock.instances[0].id).toBe(1);
        treasure3.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(1);
      });

      test('prop 2', () => {
        activePlayer.props = [];
        activePlayer.props.push(testHelper.createMockProp({ id: 2, room, playable: true }));
        const wizard = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][1]);
        const creature1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
        const creature2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);
        testHelper.giveCardToPlayer(wizard, activePlayer);
        testHelper.giveCardToPlayer(creature1, activePlayer);
        testHelper.giveCardToPlayer(creature2, activePlayer);

        wizard.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(0);
        creature1.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(1);
        expect(playSpy.mock.instances[0].id).toBe(2);
        creature2.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(2);
        expect(playSpy.mock.instances[1].id).toBe(2);
      });

      test('prop 5', () => {
        activePlayer.props = [];
        activePlayer.props.push(testHelper.createMockProp({ id: 5, room, playable: true }));
        const wizard = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][1]);
        const spell1 = testHelper.createMockCard(room, cardMap[ECardTypes.spells][3]);
        const spell2 = testHelper.createMockCard(room, cardMap[ECardTypes.spells][4]);
        testHelper.giveCardToPlayer(wizard, activePlayer);
        testHelper.giveCardToPlayer(spell1, activePlayer);
        testHelper.giveCardToPlayer(spell2, activePlayer);

        wizard.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(0);
        spell1.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(1);
        expect(playSpy.mock.instances[0].id).toBe(5);
        spell2.markAsPlayed();
        expect(playSpy).toHaveBeenCalledTimes(2);
        expect(playSpy.mock.instances[1].id).toBe(5);
      });

      test('prop 6', () => {
        activePlayer.props = [];
        activePlayer.props.push(testHelper.createMockProp({ id: 6, room, playable: true }));
        const wizard = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][1]);
        const creature = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
        const treasure = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][1]);
        const spell1 = testHelper.createMockCard(room, cardMap[ECardTypes.spells][3]);
        const spell2 = testHelper.createMockCard(room, cardMap[ECardTypes.spells][4]);
        testHelper.giveCardToPlayer(wizard, activePlayer);
        testHelper.giveCardToPlayer(creature, activePlayer);
        testHelper.giveCardToPlayer(treasure, activePlayer);
        testHelper.giveCardToPlayer(spell1, activePlayer);
        testHelper.giveCardToPlayer(spell2, activePlayer);

        wizard.markAsPlayed(); // 1
        expect(playSpy).toHaveBeenCalledTimes(0);
        creature.markAsPlayed(); // 2
        expect(playSpy).toHaveBeenCalledTimes(0);
        treasure.markAsPlayed(); // 3
        expect(playSpy).toHaveBeenCalledTimes(0);
        spell1.markAsPlayed(); // 4
        expect(playSpy).toHaveBeenCalledTimes(1);
        expect(playSpy.mock.instances[0].id).toBe(6);
        spell2.markAsPlayed(); // 4
        expect(playSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('playGuard', () => {
    test('Нельзя играть защиту без владельца', () => {
      const room = testHelper.createMockRoom('1', 'activePlayer');
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);

      const playGuardSpy = spyOn(playGuardEvent, 'playGuard').mockImplementation(async () => {});

      card.playGuard({ cardAttack: card });
      expect(console.error).toHaveBeenCalledWith('Невозможно разыграть защиту: нет владельца');
      expect(playGuardSpy).toHaveBeenCalledTimes(0);

      playGuardSpy.mockRestore();
    });
  });

  describe('theSame', () => {
    test('Корректно сравнивает карты', () => {
      const room = testHelper.createMockRoom('1', 'player');
      const card1 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      const card2 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][2]);

      expect(card1.theSame(card1)).toBeTruthy();
      expect(card1.theSame(card2)).toBeFalsy();
    });
  });

  describe('theSameType', () => {
    test('Корректно сравнивает карты', () => {
      const room = testHelper.createMockRoom('1', 'player');
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);

      expect(card.theSameType(ECardTypes.creatures)).toBeTruthy();
      expect(card.theSameType(ECardTypes.creatures, 1)).toBeTruthy();
      expect(card.theSameType(ECardTypes.treasures)).toBeFalsy();
      expect(card.theSameType(ECardTypes.creatures, 2)).toBeFalsy();
    });
  });

  describe('get owner', () => {
    test('Возвращает владельца', () => {
      const room = testHelper.createMockRoom('1', 'player');
      const player = testHelper.createMockPlayer({ room, nickname: 'player' });
      testHelper.addPlayerToRoom(room, player);
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
      testHelper.giveCardToPlayer(card, player);

      expect(card.owner).toBe(player);
    });

    test('Не возвращает владельца, если его нет', () => {
      const room = testHelper.createMockRoom('1', 'player1');
      const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);

      expect(card.owner).toBeUndefined();
    });
  });
});
