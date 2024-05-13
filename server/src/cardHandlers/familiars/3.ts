import type { TPlayCardHandler } from 'Type/events/playCard';

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

  const selected = await player.selectCards({
    cards: player.deck.slice(-2),
    variants: [{ id: 1, value: 'Уничтожить' }],
    title: 'Можешь уничтожить 1 карту из верха своей колоды',
  });

  if (!selected.cards.length) {
    markAsPlayed?.();
    return;
  }

  await player.removeCards(selected.cards, 'deck');
  markAsPlayed?.();
};

exports.default = handler;
