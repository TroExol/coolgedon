import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  room,
  card,
  canGuard,
  target,
  player,
  attacker,
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

  if (canGuard) {
    const canAttack = await finalTarget.guard({
      attacker,
      cardAttack: card,
      title: byLawlessness
        ? `Беспредел атакует на ${finalDamage} урона${room.sluggishStick.length ? ' и 1 вялую пялочку' : ''}, будете защищаться?`
        : `Игрок ${attacker.nickname} собирается наговнить вам на ${finalDamage} урона${room.sluggishStick.length ? ' и 1 вялую пялочку' : ''}, будете защищаться?`,
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
  if (room.sluggishStick.length) {
    finalTarget.takeCardsTo('discard', 1, room.sluggishStick);
  }
  markAsPlayed?.();
};

exports.default = handler;
