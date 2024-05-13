import type { TPlayLawlessnessHandlerParams } from 'Type/events/playCard';

exports.default = async function ({
  room,
  card,
}: TPlayLawlessnessHandlerParams) {
  await Promise.allSettled(room.playersArray.map(async currentTarget => {
    const canAttack = await currentTarget.guard({
      cardAttack: card,
      title: 'Будете защищаться от беспредела?',
      byLawlessness: true,
    });
    if (!canAttack) {
      return;
    }

    currentTarget.takeCardsTo('deck', 1, room.sluggishStick);
  }));
};
