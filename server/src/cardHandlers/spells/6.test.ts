import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('spells 6', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let spell6: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    spell6 = testHelper.createMockCard(room, cardMap[ECardTypes.spells][6]);
    testHelper.giveCardToPlayer(spell6, activePlayer);
  });

  test('Берет тварей', async () => {
    const creature = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    creature.ownerNickname = activePlayer.nickname;
    activePlayer.discard = [creature];

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [creature] });

    await spell6.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(spell6.played).toBeTruthy();
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.hand.length).toBe(7);
    expect(activePlayer.hand.indexOf(creature)).not.toBe(-1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Увеличивает мощь, если нет тварей', async () => {
    await spell6.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(spell6.played).toBeTruthy();
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не разыгрывается, если не выбрал тварь', async () => {
    const creature = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    creature.ownerNickname = activePlayer.nickname;
    activePlayer.discard = [creature];

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

    await spell6.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(spell6.played).toBeFalsy();
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard).toEqual([creature]);
    expect(activePlayer.hand.indexOf(creature)).toBe(-1);
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.totalPower).toBe(0);
  });
});
