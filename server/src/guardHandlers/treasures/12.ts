import type { TPlayGuardHandlerParams } from 'Event/playGuard';

import { getCardsExceptCards } from 'Helpers';

interface TCardData {
  description: string;
  from: 'hand' | 'discard';
}

exports.default = async function ({
  target,
  card,
}: TPlayGuardHandlerParams) {
  const cardsToSelect = [
    ...getCardsExceptCards(target.hand, [card])
      .map(handCard => {
        handCard.data = { description: 'Из руки', from: 'hand' };
        return handCard;
      }),
    ...target.discard
      .map(discardCard => {
        discardCard.data = { description: 'Из сброса', from: 'discard' };
        return discardCard;
      }),
  ];
  const selected = await target.selectCards({
    cards: cardsToSelect,
    variants: [{ id: 1, value: 'Уничтожить' }],
    title: 'Можешь уничтожить 1 карту из руки или сброса',
  });

  if (!selected.cards.length) {
    return;
  }

  const from = (selected.cards[0].data as TCardData).from;
  selected.cards.forEach(c => {
    c.data = undefined;
  });
  await target.removeCards(selected.cards, from);
};
