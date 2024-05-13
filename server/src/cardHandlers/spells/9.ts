import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  room,
  player,
  markAsPlayed,
}) => {
  if (player.skulls.length >= 3) {
    player.takeCardsTo('hand', 3, player.deck);
  } else {
    room.onCurrentTurn.additionalPower += 2;
  }
  markAsPlayed?.();
};

exports.default = handler;
