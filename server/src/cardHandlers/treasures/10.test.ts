import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('treasures 10', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let treasure10: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    treasure10 = testHelper.createMockCard(room, cardMap[ECardTypes.treasures][10]);
    testHelper.giveCardToPlayer(treasure10, activePlayer);
  });

  test('Берет волшебников', async () => {
    const wizard = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][1]);
    wizard.ownerNickname = activePlayer.nickname;
    activePlayer.discard = [wizard];

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [wizard] });

    await treasure10.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(treasure10.played).toBeTruthy();
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.hand.length).toBe(7);
    expect(activePlayer.hand.indexOf(wizard)).not.toBe(-1);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Увеличивает мощь, если нет волшебников', async () => {
    await treasure10.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(treasure10.played).toBeTruthy();
    expect(activePlayer.discard.length).toBe(0);
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.totalPower).toBe(2);
  });

  test('Не разыгрывается, если не выбрал волшебника', async () => {
    const wizard = testHelper.createMockCard(room, cardMap[ECardTypes.wizards][1]);
    wizard.ownerNickname = activePlayer.nickname;
    activePlayer.discard = [wizard];

    spyOn(activePlayer, 'selectCards').mockImplementation(fn()).mockResolvedValue({ cards: [] });

    await treasure10.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(treasure10.played).toBeFalsy();
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard).toEqual([wizard]);
    expect(activePlayer.hand.indexOf(wizard)).toBe(-1);
    expect(activePlayer.hand.length).toBe(6);
    expect(activePlayer.totalPower).toBe(0);
  });
});
