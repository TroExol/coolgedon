import type { TPlayLawlessnessHandlerParams } from 'Type/events/playCard';

exports.default = async function ({
  room,
}: TPlayLawlessnessHandlerParams) {
  await Promise.allSettled(room.playersArray.map(async currentTarget => {
    const selectedVariant = await currentTarget.selectVariant<number>({
      variants: [{ id: 1, value: 'Сбросить' }],
      title: 'Можешь сбросить все карты с руки и взять 2 карты, если этого не сделаешь, получишь вялую пялочку',
    });

    if (!selectedVariant) {
      currentTarget.takeCardsTo('discard', 1, room.sluggishStick);
      return;
    }
    currentTarget.discardCards(currentTarget.hand, 'hand');
    currentTarget.takeCardsTo('hand', 2, currentTarget.deck);
  }));
};
