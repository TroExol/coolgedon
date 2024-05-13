import type { TPlayPermanentHandlerParams } from 'Type/events/playCard';

const handler = async ({
  card,
  initPermanent,
}: TPlayPermanentHandlerParams) => {
  if (!initPermanent && card.owner) {
    card.owner.takeCardsTo('hand', 1, card.owner.deck);
    card.markAsPlayed();
  }
};

exports.default = handler;
