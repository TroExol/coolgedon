import type { TPlayGuardHandlerParams } from 'Event/playGuard';

import { getCardsExceptCards } from 'Helpers';

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

  const from = target.hand.includes(selected.cards[0])
    ? 'hand'
    : 'discard';
  selected.cards.forEach(c => {
    c.data = undefined;
  });
  attacker.takeCardsTo('discard', selected.cards, target[from]);
};
