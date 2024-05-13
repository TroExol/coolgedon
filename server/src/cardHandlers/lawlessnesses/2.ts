import type { TPlayLawlessnessHandlerParams } from 'Type/events/playCard';

exports.default = async function ({
  room,
  card,
}: TPlayLawlessnessHandlerParams) {
  await Promise.allSettled(room.playersArray
    .filter(currentTarget => card.canPlay({ target: currentTarget }))
    .map(async currentTarget => {
      const canAttack = await currentTarget.guard({
        cardAttack: card,
        title: 'Будете защищаться от беспредела?',
        byLawlessness: true,
      });
      if (!canAttack) {
        return;
      }

      currentTarget.damage({ damage: 5 });
    }));
};
