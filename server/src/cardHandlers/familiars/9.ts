import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  room,
  card,
  canGuard,
  target,
  player,
  attacker,
  byLawlessness,
  markAsPlayed,
}) => {
  const finalTargets = byLawlessness
    ? room.playersArray
    : target
      ? [target]
      : room.getPlayersExceptPlayer(player);

  await Promise.allSettled(finalTargets.map(async currentTarget => {
    if (canGuard) {
      const canAttack = await currentTarget.guard({
        attacker,
        cardAttack: card,
        title: byLawlessness
          ? 'Беспредел обирается дать вам 1 вялую пялочку, будете защищаться?'
          : `Игрок ${attacker.nickname} собирается дать вам 1 вялую пялочку, будете защищаться?`,
        byLawlessness,
      });
      if (!canAttack) {
        return;
      }
    }
    currentTarget.takeCardsTo('discard', 1, room.sluggishStick);
  }));
  markAsPlayed?.();
};

exports.default = handler;
