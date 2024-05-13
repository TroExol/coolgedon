import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  player,
  markAsPlayed,
}) => {
  player.takeCardsTo('hand', 2, player.deck);
  markAsPlayed?.();
};

exports.default = handler;
