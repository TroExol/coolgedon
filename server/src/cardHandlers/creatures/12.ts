import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  room,
  card,
  canGuard,
  target,
  player,
  byLawlessness,
  damage,
  markAsPlayed,
}) => {
  if (byLawlessness) {
    return;
  }

  const finalTargets = target
    ? [target]
    : room.getPlayersExceptPlayer(player);

  await Promise.allSettled(finalTargets.map(async currentTarget => {
    const finalDamage = card.getFinalDamage({
      concreteDamage: damage,
      target: currentTarget,
      attacker: player,
    });

    if (!finalDamage) {
      return;
    }

    if (canGuard) {
      const canAttack = await currentTarget.guard({
        attacker: player,
        cardAttack: card,
        title: `Игрок ${player.nickname} собирается нанести ${finalDamage} урона, будете защищаться?`,
        byLawlessness,
        damage: finalDamage,
      });
      if (!canAttack) {
        return;
      }
    }

    currentTarget.damage({
      damage: finalDamage,
      attacker: player,
    });
  }));
  markAsPlayed?.();
};

exports.default = handler;
