import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  room,
  card,
  canGuard,
  target,
  player,
  cardUsedByPlayer,
  damage,
  byLawlessness,
  markAsPlayed,
}) => {
  if (byLawlessness) {
    return;
  }

  let someoneDamaged = false;
  const targets = target
    ? [target]
    : room.getPlayersExceptPlayer(player);

  await Promise.allSettled(targets.map(async currentTarget => {
    const finalDamage = card.getFinalDamage({
      concreteDamage: damage,
      target: currentTarget,
      attacker: player,
    });
    if (!finalDamage) {
      return;
    }
    if (canGuard) {
      const canAttack = await currentTarget.guard({
        attacker: player,
        cardAttack: card,
        title: `Игрок ${player.nickname} собирается закидать вас вялыми пялочками на ${finalDamage} урона, будете защищаться?`,
        byLawlessness,
        damage: finalDamage,
      });
      if (!canAttack) {
        return;
      }
    }
    currentTarget.damage({
      attacker: player,
      damage: finalDamage,
    });
    someoneDamaged = true;
  }));
  if (!someoneDamaged && cardUsedByPlayer) {
    player.takeCardsTo('hand', 1, player.deck);
  }
  markAsPlayed?.();
};

exports.default = handler;
