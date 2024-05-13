import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
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
  const finalTarget = await player.selectTarget({ target });
  if (!finalTarget) {
    return;
  }

  const finalDamage = card.getFinalDamage({
    concreteDamage: damage,
    target: finalTarget,
    attacker,
  });

  if (!finalDamage) {
    markAsPlayed?.();
    return;
  }

  if (canGuard) {
    const canAttack = await finalTarget.guard({
      attacker,
      cardAttack: card,
      title: byLawlessness
        ? `Беспредел атакует на ${finalDamage} урона, будете защищаться?`
        : `Игрок ${attacker.nickname} собирается пихнуть в вас палкой на ${finalDamage} урона, будете защищаться?`,
      byLawlessness,
      damage: finalDamage,
    });
    if (!canAttack) {
      markAsPlayed?.();
      return;
    }
  }

  const killed = finalTarget.damage({
    damage: finalDamage,
    attacker,
  });

  if (killed && cardUsedByPlayer) {
    player.takeCardsTo('hand', 2, player.deck);
  }
  markAsPlayed?.();
};

exports.default = handler;
