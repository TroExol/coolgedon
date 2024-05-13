import type { TPlayCardHandler } from 'Type/events/playCard';

import { toPlayerVariant } from 'Helpers';

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
  const endPlay = () => {
    if (cardUsedByPlayer) {
      player.takeCardsTo('hand', 1, player.deck);
    }
    markAsPlayed?.();
  };

  let finalTarget = target;
  if (!finalTarget) {
    const leftPlayer = room.getPlayerByPos(player, 'left');
    const rightPlayer = room.getPlayerByPos(player, 'right');
    if (!leftPlayer || !rightPlayer) {
      endPlay();
      return;
    }

    const variants = [];
    if (leftPlayer) {
      variants.push(toPlayerVariant(leftPlayer));
    }
    if (rightPlayer && leftPlayer.nickname !== rightPlayer.nickname) {
      variants.push(toPlayerVariant(rightPlayer));
    }

    const selectedTarget = await player.selectVariant<string>({
      variants,
      title: 'Выбери игрока для атаки',
    });

    if (!selectedTarget) {
      return;
    }
    finalTarget = room.getPlayer(selectedTarget);
  }

  const finalDamage = card.getFinalDamage({
    concreteDamage: damage,
    target: finalTarget,
    attacker,
  });

  if (!finalDamage) {
    endPlay();
    return;
  }

  if (canGuard) {
    const canAttack = await finalTarget.guard({
      attacker,
      cardAttack: card,
      title: byLawlessness
        ? `Беспредел атакует на ${finalDamage} урона, будете защищаться?`
        : `Игрок ${attacker.nickname} собирается отфистинговать вас на ${finalDamage} урона, будете защищаться?`,
      byLawlessness,
      damage: finalDamage,
    });
    if (!canAttack) {
      endPlay();
      return;
    }
  }

  finalTarget.damage({
    damage: finalDamage,
    attacker,
  });
  endPlay();
};

exports.default = handler;
