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
      if (currentTarget.activePermanent.length === 1) {
        currentTarget.discardCards(currentTarget.activePermanent, 'activePermanent');
        return;
      }
      const selected = await currentTarget.selectCards({
        cards: currentTarget.activePermanent,
        variants: [{ id: 1, value: 'Сбросить' }],
        title: 'Сбрось 1 свою постоянку',
        canClose: false,
      });
      currentTarget.discardCards(selected.cards, 'activePermanent');
    }));
};
