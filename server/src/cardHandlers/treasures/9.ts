import { EEventTypes } from '@coolgedon/shared';

import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  room,
  player,
  markAsPlayed,
}) => {
  if (!player.deck.length) {
    player.shuffleDiscardToDeck();
  }
  if (!player.deck.length) {
    markAsPlayed?.();
    return;
  }
  const topCard = player.deck.slice(-1)[0];
  player.heal(topCard.getTotalCost(player));
  markAsPlayed?.();

  room.emitToPlayers([player], EEventTypes.showModalCards, {
    cards: [topCard.format()],
    title: 'Верхняя карта вашей колоды',
    canClose: true,
  });
};

exports.default = handler;
