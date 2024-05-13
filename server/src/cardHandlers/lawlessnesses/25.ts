import { ECardTypes } from '@coolgedon/shared';

import type { TPlayLawlessnessHandlerParams } from 'Type/events/playCard';

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

      const cards = currentTarget.getCards('discard', ECardTypes.seeds, 1);
      currentTarget.takeCardsTo('deck', cards, currentTarget.discard);
    }));
};
