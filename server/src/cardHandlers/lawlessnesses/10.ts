import type { TPlayLawlessnessHandlerParams } from 'Type/events/playCard';
import type { Player } from 'Entity/player';

exports.default = async function ({
  room,
}: TPlayLawlessnessHandlerParams) {
  const minCost: [Player[], number] = room.playersArray.reduce<[Player[], number]>((acc, currentTarget) => {
    const sumHandCost = currentTarget.hand.reduce((sum, card) => sum + card.getTotalCost(currentTarget), 0);

    if (sumHandCost === acc[1]) {
      acc[0].push(currentTarget);
    } else if (sumHandCost < acc[1]) {
      acc[0] = [currentTarget];
      acc[1] = sumHandCost;
    }
    return acc;
  }, [[], 999]);
  minCost[0].forEach(currentTarget => {
    currentTarget.takeCardsTo('hand', 2, currentTarget.deck);
  });
};
