import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';
import { Card } from 'Entity/card';

import spyOn = jest.spyOn;
import fn = jest.fn;

describe('lawlessnesses 1', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let lawlessness1: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    lawlessness1 = testHelper.createMockCard(room, cardMap[ECardTypes.lawlessnesses][1]);
  });

  test('Разыгрывается', async () => {
    const topCard = getLastElement(room.legends)!;

    const playSpy = spyOn(topCard, 'play').mockImplementation(fn()).mockResolvedValue(undefined);

    await lawlessness1.play({ type: 'lawlessness' });

    expect(lawlessness1.played).toBeFalsy();
    expect(playSpy.mock.calls[0][0].type).toBe('groupAttack');
  });

  test('Не разыгрывается, если нет легенд', async () => {
    room.legends = [];

    const playSpy = spyOn(Card.prototype, 'play');

    await lawlessness1.play({ type: 'lawlessness' });

    expect(lawlessness1.played).toBeFalsy();
    expect(playSpy).toHaveBeenCalledTimes(1);

    playSpy.mockRestore();
  });
});
