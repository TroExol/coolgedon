import type { TPlayGuardHandlerParams } from 'Event/playGuard';

import { getCardsExceptCards } from 'Helpers';

exports.default = async function ({
  target,
  attacker,
  cardAttack,
  damage,
  card,
}: TPlayGuardHandlerParams) {
  target.takeCardsTo('hand', 1, target.deck);

  if (attacker) {
    void cardAttack.play({
      type: 'simple',
      params: {
        target: attacker,
        attacker: target,
        canGuard: false,
        damage,
      },
    });
  }

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
