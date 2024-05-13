import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  player,
  markAsPlayed,
}) => {
  player.heal(6);
  markAsPlayed?.();
};

exports.default = handler;
