import type { TPlayGuardHandlerParams } from 'Event/playGuard';

import { getCardsExceptCards } from 'Helpers';

exports.default = async function ({
  target,
  card,
}: TPlayGuardHandlerParams) {
  target.takeCardsTo('hand', 1, target.deck);

  const selected = await target.selectCards({
    cards: getCardsExceptCards(target.hand, [card]),
    variants: [{ id: 1, value: 'Уничтожить' }],
    title: 'Можешь уничтожить 1 карту у себя на руке',
  });

  if (!selected.cards.length) {
    return;
  }

  await target.removeCards(selected.cards, 'hand');
};
