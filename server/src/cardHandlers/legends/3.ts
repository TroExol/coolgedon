import { ECardTypes } from '@coolgedon/shared';

import type { TPlayCardHandler } from 'Type/events/playCard';

import { getCountCardsIn } from 'Helpers';

const handler: TPlayCardHandler = async ({
  player,
  markAsPlayed,
}) => {
  const countSeeds = getCountCardsIn([...player.hand, ...player.discard], ECardTypes.seeds);

  if (countSeeds) {
    player.heal(countSeeds);
  }

  markAsPlayed?.();
};

exports.default = handler;
