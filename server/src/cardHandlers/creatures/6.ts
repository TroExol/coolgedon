import type { TPlayCardHandler } from 'Type/events/playCard';

import { getMinHpPlayers, getRandomElements } from 'Helpers';

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
  let finalTarget = target;
  if (!finalTarget) {
    const targets = byLawlessness
      ? room.playersArray
      : room.getPlayersExceptPlayer(player);
    // Игрок с минимальным хп
    finalTarget = getMinHpPlayers(targets)[0];
  }

  if (!finalTarget) {
    markAsPlayed?.();
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
        : `Игрок ${attacker.nickname} собирается провести вам фаталити на ${finalDamage} урона, будете защищаться?`,
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
    giveSkull: false,
  });

  if (!killed) {
    markAsPlayed?.();
    return;
  }

  const selected = await player.selectSkulls({
    skulls: getRandomElements(room.skulls, 2),
    variants: [{ id: 1, value: 'Выбрать' }],
    title: `Выбери жетон для игрока ${finalTarget.nickname}`,
    canClose: false,
  });

  const selectedSkull = selected.skulls[0];
  finalTarget.takeSkull(selectedSkull, room.skulls);
  await selectedSkull.play({ killer: attacker });
  markAsPlayed?.();
};

exports.default = handler;
