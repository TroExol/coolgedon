import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('creature 5', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let creature5: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    creature5 = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][5]);
    testHelper.giveCardToPlayer(creature5, activePlayer);
  });

  test('Берет сокровища', async () => {
    const treasure = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][1]);
    treasure.ownerNickname = activePlayer.nickname;
    activePlayer.discard = [treasure];

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [treasure] });

    await creature5.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature5.played).toBeTruthy();
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.hand.length).toBe(7);
    expect(activePlayer.hand.indexOf(treasure)).not.toBe(-1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Увеличивает мощь, если нет сокровищ', async () => {
    await creature5.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature5.played).toBeTruthy();
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не разыгрывается, если не выбрал сокровище', async () => {
    const treasure = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][1]);
    treasure.ownerNickname = activePlayer.nickname;
    activePlayer.discard = [treasure];

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

    await creature5.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(creature5.played).toBeFalsy();
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard).toEqual([treasure]);
    expect(activePlayer.hand.indexOf(treasure)).toBe(-1);
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.totalPower).toBe(0);
  });
});
