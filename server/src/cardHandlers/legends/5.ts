import { ECardTypes } from '@coolgedon/shared';

import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  room,
  player,
  markAsPlayed,
}) => {
  const spells = player.getCards('discard', ECardTypes.spells);
  if (spells.length) {
    player.takeCardsTo('hand', spells, player.discard);
  } else {
    room.onCurrentTurn.additionalPower += 2;
    room.sendInfo();
  }
  markAsPlayed?.();
};

exports.default = handler;
