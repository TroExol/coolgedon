import type { TPlayCardHandler } from 'Type/events/playCard';

import { getLastElement } from 'Helpers';

const handler: TPlayCardHandler = async ({
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
  const topCard = getLastElement(player.deck)!;
  const selected = await player.selectCards({
    cards: [topCard],
    variants: [
      { id: 1, value: 'Взять' },
      { id: 2, value: 'Уничтожить' },
    ],
    canClose: false,
  });

  if (selected.variant === 1) {
    player.takeCardsTo('hand', [topCard], player.deck);
  } else {
    await player.removeCards([topCard], 'deck');
  }
  markAsPlayed?.();
};

exports.default = handler;
