import { EEventTypes, EModalTypes } from '@coolgedon/shared';

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

  room.wsSendMessage({
    event: EEventTypes.showModal,
    data: {
      modalType: EModalTypes.cards,
      cards: [topCard.format()],
      title: 'Верхняя карта вашей колоды',
      canClose: true,
      select: false,
    },
  }, [player]);
};

exports.default = handler;
