import type { TPlayLawlessnessHandlerParams } from 'Type/events/playCard';

import { getRandomElements } from 'Helpers';

exports.default = async function ({
  room,
  card,
}: TPlayLawlessnessHandlerParams) {
  await Promise.allSettled(room.playersArray
    .filter(currentTarget => card.canPlay({ target: currentTarget }))
    .map(async currentTarget => {
      const canAttack = await currentTarget.guard({
        cardAttack: card,
        title: 'Будете защищаться от беспредела?',
        byLawlessness: true,
      });
      if (!canAttack) {
        return;
      }

      if (currentTarget.hand.length) {
        await currentTarget.removeCards(getRandomElements(currentTarget.hand, 1), 'hand');
      }
      if (room.crazyMagic.length) {
        currentTarget.takeCardsTo('hand', 1, room.crazyMagic);
      }
    }));
};
