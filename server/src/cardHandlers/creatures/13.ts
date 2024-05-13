import type { TPlayCardHandler } from 'Type/events/playCard';
import type { Card } from 'Entity/card';

import { getRandomElements } from 'Helpers';

const handler: TPlayCardHandler = async ({
  room,
  card,
  player,
  markAsPlayed,
}) => {
  room.getPlayersExceptPlayer(player).forEach(currentTarget => {
    if (!card.canPlay({ target: currentTarget })) {
      return;
    }
    const randomCard: Card | undefined = getRandomElements(currentTarget.hand, 1)[0];
    if (!randomCard) {
      return;
    }
    currentTarget.discardCards([randomCard], 'hand');
    currentTarget.damage({
      damage: randomCard.getTotalCost(currentTarget),
      attacker: player,
    });
  });
  markAsPlayed?.();
};

exports.default = handler;
