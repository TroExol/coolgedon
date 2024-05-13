import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  player,
  markAsPlayed,
}) => {
  player.takeCardsTo('hand', 1, player.deck);
  player.heal(2);
  markAsPlayed?.();
};

exports.default = handler;
