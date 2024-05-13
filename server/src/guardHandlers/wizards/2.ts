import type { TPlayGuardHandlerParams } from 'Event/playGuard';

import { getCardsExceptCards } from 'Helpers';

exports.default = async function ({ target }: TPlayGuardHandlerParams) {
  if (!target.deck.length) {
    target.shuffleDiscardToDeck();
  }
  if (!target.deck.length) {
    return;
  }

  const cards = target.deck.slice(-2);

  if (cards.length === 1) {
    target.takeCardsTo('hand', cards, target.deck);
    return;
  }

  const selected = await target.selectCards({
    cards,
    variants: [{ id: 1, value: 'Взять' }],
    title: 'Выбери карту, которую возьмешь, другая пойдет в сброс',
    canClose: false,
  });

  const cardsToDiscard = getCardsExceptCards(cards, selected.cards);
  target.takeCardsTo('hand', selected.cards, target.deck);
  target.discardCards(cardsToDiscard, 'deck');
};
