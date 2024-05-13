import { ECardTypes } from '@coolgedon/shared';

import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  room,
  player,
  markAsPlayed,
}) => {
  const treasures = player.getCards('discard', ECardTypes.treasures);
  if (treasures.length) {
    player.takeCardsTo('hand', treasures, player.discard);
  } else {
    room.onCurrentTurn.additionalPower += 2;
    room.sendInfo();
  }
  markAsPlayed?.();
};

exports.default = handler;
