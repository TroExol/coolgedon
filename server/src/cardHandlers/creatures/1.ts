import { EEventTypes } from '@coolgedon/shared';

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

  const finalDamage = card.getFinalDamage({ concreteDamage: damage, target: finalTarget, attacker });

  if (canGuard) {
    const canAttack = await finalTarget.guard({
      attacker,
      cardAttack: card,
      title: byLawlessness
        ? `Беспредел атакует на ${finalDamage} урона, будете защищаться?`
        : `Игрок ${attacker.nickname} собирается вонзить в вас нож на ${finalDamage} урона, будете защищаться?`,
      byLawlessness,
      damage: finalDamage,
    });
    if (!canAttack) {
      markAsPlayed?.();
      return;
    }
  }

  finalTarget.damage({ damage: finalDamage, attacker });

  const otherPlayers = room.getPlayersExceptPlayer(finalTarget);
  room.emitToPlayers(otherPlayers, EEventTypes.showModalCards, {
    cards: finalTarget.hand.map(handCard => handCard.format()),
    title: `Карты на руке игрока ${finalTarget.nickname}`,
  });

  markAsPlayed?.();
};

exports.default = handler;
