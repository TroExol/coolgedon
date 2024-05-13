import type { TPlayGuardHandlerParams } from 'Event/playGuard';

import { getCardsExceptCards } from 'Helpers';

interface TCardData {
  description: string;
  from: 'hand' | 'discard';
}

exports.default = async function ({
  target,
  attacker,
  card,
}: TPlayGuardHandlerParams) {
  if (!attacker) {
    return;
  }
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
    variants: [{ id: 1, value: 'Положить' }],
    title: 'Можешь положить 1 карту из своей руки или стопки сброса в стопку сброса атакующего',
  });

  if (!selected.cards.length) {
    return;
  }

  const from = (selected.cards[0].data as TCardData).from;
  selected.cards.forEach(c => {
    c.data = undefined;
  });
  attacker.takeCardsTo('discard', selected.cards, target[from]);
};
