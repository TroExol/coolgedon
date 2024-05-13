import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  room,
  player,
  markAsPlayed,
}) => {
  const selected = await player.selectCards({
    cards: room.shop,
    variants: [{ id: 1, value: 'Уничтожить' }],
    title: 'Можешь уничтожить и заменить 1 карту на барахолке',
  });

  if (!selected.cards.length) {
    markAsPlayed?.();
    return;
  }

  await room.removeShopCards(selected.cards);
  markAsPlayed?.();
};

exports.default = handler;
