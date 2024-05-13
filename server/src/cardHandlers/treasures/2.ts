import type { TPlayPermanentHandlerParams } from 'Type/events/playCard';

const handler = async ({
  card,
}: TPlayPermanentHandlerParams) => {
  if (!card.owner) {
    return;
  }
  card.owner.heal(3);
  card.markAsPlayed();
};

exports.default = handler;
