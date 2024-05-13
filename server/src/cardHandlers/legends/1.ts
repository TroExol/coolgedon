import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  room,
  player,
  byLawlessness,
  markAsPlayed,
}) => {
  if (byLawlessness) {
    return;
  }
  player.takeCardsTo('hand', 1, player.deck);
  room.getPlayersExceptPlayer(player).forEach(currentTarget => {
    currentTarget.damage({
      damage: 1,
      attacker: player,
    });
  });
  markAsPlayed?.();
};

exports.default = handler;
