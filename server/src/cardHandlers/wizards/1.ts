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

  if (cardUsedByPlayer) {
    player.takeCardsTo('hand', 1, player.deck);
  }

  const finalDamage = card.getFinalDamage({
    concreteDamage: damage,
    target: finalTarget,
    attacker,
  });

  if (!finalDamage) {
    markAsPlayed?.();
  }

  if (canGuard) {
    const canAttack = await finalTarget.guard({
      attacker,
      cardAttack: card,
      title: byLawlessness
        ? `Беспредел атакует на ${finalDamage} урона, будете защищаться?`
        : `Игрок ${attacker.nickname} собирается сжечь вас на ${finalDamage} урона, будете защищаться?`,
      byLawlessness,
      damage: finalDamage,
    });
    if (!canAttack) {
      markAsPlayed?.();
      return;
    }
  }

  finalTarget.damage({
    damage: finalDamage,
    attacker,
  });
  markAsPlayed?.();
};

exports.default = handler;
