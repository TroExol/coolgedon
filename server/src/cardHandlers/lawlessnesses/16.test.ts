import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('lawlessnesses 16', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let lawlessness16: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    lawlessness16 = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][16]);
  });

  test('Разыгрывается', async () => {
    spyOn(activePlayer, 'selectVariant').mockImplementation(fn()).mockResolvedValue(1);
    spyOn(otherPlayer, 'selectVariant').mockImplementation(fn()).mockResolvedValue(1);

    await lawlessness16.play({ type: 'lawlessness' });

    expect(lawlessness16.played).toBeFalsy();
    expect(activePlayer.discard.length).toBe(5);
    expect(activePlayer.deck.length).toBe(3);
    expect(activePlayer.hand.length).toBe(2);
    expect(otherPlayer.discard.length).toBe(5);
    expect(otherPlayer.deck.length).toBe(3);
    expect(otherPlayer.hand.length).toBe(2);
    expect(activePlayer.totalPower).toBe(0);
  });

  test('Дает палку, если не согласились сбросить руку', async () => {
    spyOn(activePlayer, 'selectVariant').mockImplementation(fn()).mockResolvedValue(undefined);
    spyOn(otherPlayer, 'selectVariant').mockImplementation(fn()).mockResolvedValue(1);

    await lawlessness16.play({ type: 'lawlessness' });

    expect(lawlessness16.played).toBeFalsy();
    expect(activePlayer.discard.length).toBe(1);
    expect(activePlayer.discard[0].type).toBe(ECardTypes.sluggishStick);
    expect(activePlayer.discard[0].ownerNickname).toBe('activePlayer');
    expect(activePlayer.deck.length).toBe(5);
    expect(activePlayer.hand.length).toBe(5);
    expect(otherPlayer.discard.length).toBe(5);
    expect(otherPlayer.deck.length).toBe(3);
    expect(otherPlayer.hand.length).toBe(2);
    expect(activePlayer.totalPower).toBe(0);
  });
});
