import type { TPlayCardHandler } from 'Type/events/playCard';

import { getCardsExceptCards } from 'Helpers';

const handler: TPlayCardHandler = async ({
  room,
  card,
  target,
  player,
  attacker,
  cardUsedByPlayer,
  damage,
  canGuard,
  byLawlessness,
  markAsPlayed,
}) => {
  let someoneDamaged = false;
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
        damage: finalDamage,
      });
      if (!canAttack) {
        return;
      }
    }
    someoneDamaged = true;
    currentTarget.damage({
      attacker,
      damage: finalDamage,
    });
  }));
  if (someoneDamaged || !cardUsedByPlayer) {
    markAsPlayed?.();
    return;
  }
  const selected = await player.selectCards({
    cards: getCardsExceptCards(player.hand, [card]),
    variants: [{ id: 1, value: 'Уничтожить' }],
    title: 'Можешь уничтожить 1 карту из своей руки',
  });

  if (!selected.cards.length) {
    markAsPlayed?.();
    return;
  }

  await player.removeCards(selected.cards, 'hand');
  markAsPlayed?.();
};

exports.default = handler;
