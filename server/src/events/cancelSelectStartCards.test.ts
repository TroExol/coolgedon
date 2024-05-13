import { cardMap, propMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';

import * as testHelper from 'Helpers/tests';
import { cancelSelectStartCards } from 'Event/cancelSelectStartCards';

import spyOn = jest.spyOn;

describe('cancelSelectStartCards', () => {
  let room: Room;
  let activePlayer: Player;

  beforeEach(() => {
    room = testHelper.createMockRoom('1', 'activePlayer');
    activePlayer = testHelper.createMockPlayer({ room, nickname: 'activePlayer' });
    testHelper.addPlayerToRoom(room, activePlayer);

    spyOn(room, 'logEvent');
    spyOn(room, 'sendInfo');
  });

  test('Возвращаются фамильяр и свойство в комнату', () => {
    const familiar = testHelper.createMockCard(room, cardMap[ECardTypes.familiars][1]);
    const prop = testHelper.createMockProp(propMap[1]);

    cancelSelectStartCards({ room, familiars: [familiar], props: [prop] });

    expect(room.familiars.indexOf(familiar)).not.toBe(-1);
    expect(room.props.indexOf(prop)).not.toBe(-1);
  });
});
