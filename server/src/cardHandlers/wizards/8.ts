import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  room,
  player,
  markAsPlayed,
}) => {
  const countPlayedCards = Object.values(room.onCurrentTurn.playedCards).flat().length;
  if (!countPlayedCards) {
    player.discardCards(player.hand, 'hand');
    player.takeCardsTo('hand', 4, player.deck);
  }
  markAsPlayed?.();
};

exports.default = handler;
