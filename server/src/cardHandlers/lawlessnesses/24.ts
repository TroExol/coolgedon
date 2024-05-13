import type { TPlayLawlessnessHandlerParams } from 'Type/events/playCard';
import type { Card } from 'Entity/card';

import { getMaxCostCards } from 'Helpers';

exports.default = async function ({
  room,
  card,
}: TPlayLawlessnessHandlerParams) {
  await Promise.allSettled(room.playersArray
    .filter(currentTarget => card.canPlay({ target: currentTarget }))
    .map(async currentTarget => {
      const maxCostCard: Card | undefined = getMaxCostCards(currentTarget.hand, currentTarget)[0];

      if (!maxCostCard) {
        return;
      }

      const selected = await currentTarget.selectCards({
        cards: [maxCostCard],
        variants: [{ id: 1, value: 'Уничтожить' }],
        title: 'Можешь уничтожить эту карту с руки, чтобы накрутить 13 жизней',
      });

      if (!selected.cards.length) {
        return;
      }

      await currentTarget.removeCards(selected.cards, 'hand');
      currentTarget.heal(13);
    }));
};
