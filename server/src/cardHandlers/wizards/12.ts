import type { TPlayCardHandler } from 'Type/events/playCard';

import { getCardsExceptCards } from 'Helpers';

const handler: TPlayCardHandler = async ({
  player,
  markAsPlayed,
  card,
}) => {
  player.takeCardsTo('hand', 2, player.deck);
  const selected = await player.selectCards({
    cards: getCardsExceptCards(player.hand, [card]),
    variants: [{ id: 1, value: 'Сбросить' }],
    title: 'Сбросьте 1 карту из руки',
    canClose: false,
  });

  player.discardCards(selected.cards, 'hand');
  player.heal(selected.cards[0].getTotalCost(player));

  if (player.hp >= 25 && player.skulls.length) {
    const selectedSkulls = await player.selectSkulls({
      skulls: player.skulls,
      variants: [{ id: 1, value: 'Сбросить' }],
      title: 'Сбросьте 1 жетон',
      canClose: false,
    });
    player.removeSkulls(selectedSkulls.skulls);
  }
  markAsPlayed?.();
};

exports.default = handler;
