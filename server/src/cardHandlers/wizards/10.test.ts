import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('wizards 10', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let wizard10: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    wizard10 = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][10]);
    testHelper.giveCardToPlayer(wizard10, activePlayer);
  });

  test('Берет заклинания', async () => {
    const spell = testHelper.createMockCard(room, cardMap[ECardTypes.spells][3]);
    spell.ownerNickname = activePlayer.nickname;
    activePlayer.discard = [spell];

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [spell] });

    await wizard10.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard10.played).toBeTruthy();
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.hand.length).toBe(7);
    expect(activePlayer.hand.indexOf(spell)).not.toBe(-1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Увеличивает мощь, если нет заклинаний', async () => {
    await wizard10.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard10.played).toBeTruthy();
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не разыгрывается, если не выбрал заклинание', async () => {
    const spell = testHelper.createMockCard(room, cardMap[ECardTypes.spells][3]);
    spell.ownerNickname = activePlayer.nickname;
    activePlayer.discard = [spell];

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

    await wizard10.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(wizard10.played).toBeFalsy();
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard).toEqual([spell]);
    expect(activePlayer.hand.indexOf(spell)).toBe(-1);
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.totalPower).toBe(0);
  });
});
