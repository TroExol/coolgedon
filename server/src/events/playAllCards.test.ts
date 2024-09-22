import { cardMap } from 'AvailableCards';
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';

import * as testHelper from 'Helpers/tests';
import { playAllCards } from 'Event/playAllCards';
import { Card } from 'Entity/card';

import spyOn = jest.spyOn;

const fn = jest.fn;
const mock = jest.mock;
const restoreAllMocks = jest.restoreAllMocks;

describe('playAllCards', () => {
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

  test('Разыгрываются все карты в руке', async () => {
    const playSpy = spyOn(Card.prototype, 'play').mockImplementation(async () => {});

    await playAllCards(room);

    expect(playSpy).toHaveBeenCalledTimes(5);

    playSpy.mockRestore();
  });

  test('Не разыгрываются все карты в руке дважды при быстром нажатии кнопки', async () => {
    const card = testHelper.createMockCard(room, cardMap[ECardTypes.creatures][1]);
    card.ownerNickname = activePlayer.nickname;
    activePlayer.hand = [card];

    const handlerMock = fn().mockResolvedValue(null);
    mock('../cardHandlers/creatures/1', () => ({
      default: handlerMock,
    }));

    await Promise.allSettled([
      playAllCards(room),
      playAllCards(room),
    ]);

    expect(card.playing).toBeFalsy();
    expect(handlerMock).toHaveBeenCalledTimes(1);

    restoreAllMocks();
  });
});
