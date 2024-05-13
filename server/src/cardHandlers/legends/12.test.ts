import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import * as testHelper from 'Helpers/tests';
import { getLastElement } from 'Helpers';
import { buyLegendCard } from 'Event/buyLegendCard';

describe('legends 12', () => {
  let room: Room;
  let activePlayer: Player;
  let otherPlayer: Player;
  let legend12: Card;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    const prop4 = testHelper.createMockProp(propMap[4]);
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer', prop: prop4 });
    otherPlayer = testHelper.createMockPlayer({ room, nickname: 'otherPlayer', prop: prop4 });
    testHelper.addPlayerToRoom(room, activePlayer);
    testHelper.addPlayerToRoom(room, otherPlayer);
    legend12 = testHelper.createMockCard(room, cardMap[ECardTypes.legends][12]);
    testHelper.giveCardToPlayer(legend12, activePlayer);
  });

  test('Разыгрывается', async () => {
    await legend12.play({ type: 'simple', params: { cardUsedByPlayer: true } });

    expect(legend12.played).toBeTruthy();
    expect(activePlayer.props.length).toBe(2);
    expect(getLastElement(activePlayer.props)?.temp).toBeTruthy();
    expect(getLastElement(activePlayer.props)?.ownerNickname).toBe(activePlayer.nickname);
    expect(activePlayer.totalPower).toBe(3);
  });

  test('Свойство возвращается после покупки легенды', async () => {
    const prop = testHelper.createMockProp({ room, ...propMap[1] });
    prop.temp = true;
    activePlayer.props.push(prop);
    room.onCurrentTurn.additionalPower = 20;

    buyLegendCard(room);

    expect(activePlayer.props.length).toBe(1);
    expect(activePlayer.props.includes(prop)).toBeFalsy();
    expect(room.props.includes(prop)).toBeTruthy();
    expect(prop.temp).toBeFalsy();
  });
});
