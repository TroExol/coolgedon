import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  room,
  card,
  canGuard,
  target,
  player,
  attacker,
  cardUsedByPlayer,
  damage,
  byLawlessness,
  markAsPlayed,
}) => {
  if (byLawlessness) {
    return;
  }

  if (cardUsedByPlayer) {
    player.heal(2);
  }

  const finalTargets = target
    ? [target]
    : room.getPlayersExceptPlayer(player).filter(p => p.hp < player.hp);

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
        damage: finalDamage,
      });
      if (!canAttack) {
        return;
      }
    }

    currentTarget.damage({
      attacker,
      damage: finalDamage,
    });
  }));
  markAsPlayed?.();
};

exports.default = handler;
