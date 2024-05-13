import type { TPlayLawlessnessHandlerParams } from 'Type/events/playCard';

import { getCardsExceptCards } from 'Helpers';

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

      if (!currentTarget.deck.length) {
        currentTarget.shuffleDiscardToDeck();
      }
      if (!currentTarget.deck.length) {
        return;
      }

      const cards = currentTarget.deck.slice(-2);
      const selected = await currentTarget.selectCards({
        cards,
        variants: [{ id: 1, value: 'Уничтожить' }],
        title: 'Какую карту уничтожишь, чтобы взять другую (если есть такая). Получи урон, равный стоимости взятой карты',
        canClose: false,
      });
      await currentTarget.removeCards(selected.cards, 'deck');
      const cardsToHand = getCardsExceptCards(cards, selected.cards);
      if (!cardsToHand.length) {
        return;
      }
      currentTarget.takeCardsTo('hand', cardsToHand, currentTarget.deck);
      currentTarget.damage({ damage: cardsToHand[0].getTotalCost(currentTarget) });
    }));
};
