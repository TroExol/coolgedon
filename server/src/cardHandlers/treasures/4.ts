import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  room,
  card,
  target,
  player,
  attacker,
  damage,
  canGuard,
  byLawlessness,
  markAsPlayed,
}) => {
  const finalTargets = [];
  if (target) {
    finalTargets.push(target);
  } else {
    const leftPlayer = room.getPlayerByPos(player, 'left');
    const rightPlayer = room.getPlayerByPos(player, 'right');
    if (!leftPlayer || !rightPlayer) {
      markAsPlayed?.();
      return;
    }

    if (leftPlayer) {
      finalTargets.push(leftPlayer);
    }
    if (rightPlayer && leftPlayer.nickname !== rightPlayer.nickname) {
      finalTargets.push(rightPlayer);
    }
  }

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
          : `Игрок ${attacker.nickname} собирается разорвать вам барабанные перепонки на ${finalDamage} урона, будете защищаться?`,
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
