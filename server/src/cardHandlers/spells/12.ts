import type { TPlayCardHandler } from 'Type/events/playCard';

import { getCardsExceptCards } from 'Helpers';

const handler: TPlayCardHandler = async ({
  player,
  markAsPlayed,
  card,
}) => {
  const discardCardsExceptPlay = getCardsExceptCards(player.discard, [card]);

  if (!discardCardsExceptPlay.length) {
    markAsPlayed?.();
    return;
  }

  const selected = await player.selectCards({
    cards: discardCardsExceptPlay,
    variants: [{ id: 1, value: 'Уничтожить' }],
    title: 'Можешь уничтожить 1 карту из своей стопки сброса',
  });
  if (!selected.cards.length) {
    markAsPlayed?.();
    return;
  }

  await player.removeCards(selected.cards, 'discard');
  markAsPlayed?.();
};

exports.default = handler;
