import type { TPlayLawlessnessHandlerParams } from 'Type/events/playCard';

import { getMaxHpPlayers } from 'Helpers';

exports.default = async function ({
  room,
  card,
}: TPlayLawlessnessHandlerParams) {
  await Promise.allSettled(getMaxHpPlayers(room.playersArray).map(async currentTarget => {
    const canAttack = await currentTarget.guard({
      cardAttack: card,
      title: 'Будете защищаться от беспредела?',
      byLawlessness: true,
    });
    if (!canAttack) {
      return;
    }

    currentTarget.damage({ damage: 6 });
  }));
};
