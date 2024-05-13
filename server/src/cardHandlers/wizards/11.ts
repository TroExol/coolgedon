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
  const targets = room.getPlayersExceptPlayer(player).filter(p => p.hand.length);
  if (!targets.length && !target) {
    markAsPlayed?.();
    return;
  }
  const finalTarget = await player.selectTarget({
    targetsToSelect: targets,
    target,
  });

  if (!finalTarget) {
    return;
  }

  const cardsCostMore5 = finalTarget.hand.filter(c => c.getTotalCost(finalTarget) >= 5);
  if (!cardsCostMore5) {
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
      cardsToShow: cardsCostMore5,
      cardAttack: card,
      title: byLawlessness
        ? `Беспредел собирается заставить вас сбросить 1 карту со стоимостью 5 или больше, если избежите, то получите ${finalDamage} урона, будете защищаться?`
        : `Игрок ${attacker.nickname} побеждает в битве разума и собирается заставить вас сбросить 1 карту со стоимостью 5 или больше, если избежите, то получите ${finalDamage} урона, будете защищаться?`,
      byLawlessness,
    });
    if (!canAttack) {
      finalTarget.damage({
        attacker,
        damage: finalDamage,
      });
      markAsPlayed?.();
      return;
    }
  }

  const selected = await finalTarget.selectCards({
    cards: cardsCostMore5,
    variants: [{ id: 1, value: 'Сбросить' }],
    title: 'Выбери 1 карту, которую сбросишь из своей руки',
    canClose: false,
  });

  finalTarget.discardCards(selected.cards, 'hand');
  markAsPlayed?.();
};

exports.default = handler;
