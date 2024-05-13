import type { TPlayLawlessnessHandlerParams } from 'Type/events/playCard';

exports.default = async function ({
  room,
}: TPlayLawlessnessHandlerParams) {
  await Promise.allSettled(room.playersArray.map(async currentTarget => {
    const selectedVariant = await currentTarget.selectVariant<number>({
      variants: [{ id: 1, value: 'Получить' }],
      title: 'Можешь получить верхнюю карту основной колоды и уничтожить верхнюю карту своей колоды',
    });

    if (!selectedVariant) {
      return;
    }

    currentTarget.takeCardsTo('discard', 1, room.deck);
    if (!currentTarget.deck.length) {
      currentTarget.shuffleDiscardToDeck();
    }
    if (currentTarget.deck.length) {
      await currentTarget.removeCards(currentTarget.deck.slice(-1), 'deck');
    }
  }));
};
