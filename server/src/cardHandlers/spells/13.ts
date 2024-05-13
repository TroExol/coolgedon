import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  room,
  card,
  player,
  target,
  attacker,
  damage,
  canGuard,
  byLawlessness,
  markAsPlayed,
}) => {
  const finalTargets = byLawlessness
    ? room.playersArray
    : target
      ? [target]
      : room.getPlayersExceptPlayer(player);

  await Promise.allSettled(finalTargets.map(async currentTarget => {
    const finalDamage = card.getFinalDamage({
      concreteDamage: damage,
      target: currentTarget,
      attacker,
    });

    if (!finalDamage) {
      return;
    }

    if (canGuard) {
      const canAttack = await currentTarget.guard({
        attacker,
        cardAttack: card,
        title: byLawlessness
          ? `Беспредел собирается нанести ${finalDamage} урона, будете защищаться?`
          : `Игрок ${attacker.nickname} собирается нанести ${finalDamage} урона, будете защищаться?`,
        byLawlessness,
      });
      if (!canAttack) {
        return;
      }
    }

    currentTarget.damage({
      damage: finalDamage,
      attacker,
    });
  }));
  markAsPlayed?.();
};

exports.default = handler;
