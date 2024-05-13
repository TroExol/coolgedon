import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  room,
  card,
  canGuard,
  target,
  player,
  attacker,
  byLawlessness,
  markAsPlayed,
}) => {
  const finalTargets = byLawlessness
    ? room.playersArray
    : target
      ? [target]
      : room.getPlayersExceptPlayer(player);

  await Promise.allSettled(finalTargets
    .filter(currentTarget => card.canPlay({ target: currentTarget }))
    .map(async currentTarget => {
      if (canGuard) {
        const canAttack = await currentTarget.guard({
          attacker,
          cardAttack: card,
          title: byLawlessness
            ? 'Беспредел собирается заставить вас сбросить 1 карту, будете защищаться?'
            : `Игрок ${attacker.nickname} собирается заставить вас сбросить 1 карту, будете защищаться?`,
          byLawlessness,
        });
        if (!canAttack) {
          return;
        }
      }

      const selected = await currentTarget.selectCards({
        cards: currentTarget.hand,
        variants: [{
          id: 1,
          value: 'Сбросить',
        }],
        title: 'Выбери 1 карту, которую сбросишь из своей руки',
        canClose: false,
      });

      currentTarget.discardCards(selected.cards, 'hand');
    }));
  markAsPlayed?.();
};

exports.default = handler;
