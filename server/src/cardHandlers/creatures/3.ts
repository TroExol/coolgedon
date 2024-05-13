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
    cards: player.deck.slice(-1),
    variants: [
      { id: 1, value: 'Уничтожить' },
      { id: 2, value: 'Оставить наверху колоды' },
    ],
    title: 'Можешь уничтожить или оставить верхнюю карту своей колоды',
  });

  if (selected.variant === 1) {
    await player.removeCards(selected.cards, 'deck');
  }
  if (selected.variant) {
    markAsPlayed?.();
  }
};

exports.default = handler;
