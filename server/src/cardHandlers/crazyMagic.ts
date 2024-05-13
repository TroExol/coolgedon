import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  room,
  card,
  target,
  player,
  byLawlessness,
}) => {
  if (byLawlessness) {
    return;
  }
  if (!card.canPlay({ target })) {
    room.onCurrentTurn.additionalPower += 2;
    card.markAsPlayed();
    return;
  }

  const selectedAction = await player.selectVariant<number>({
    variants: [
      { id: 1, value: '+2 мощи' },
      { id: 2, value: 'Взять карту с верха колоды у другого игрока' },
    ],
    title: 'Выбери действие',
  });

  if (!selectedAction) {
    return;
  }

  if (selectedAction === 1) {
    room.onCurrentTurn.additionalPower += 2;
    card.markAsPlayed();
    return;
  }

  const finalTarget = await player.selectTarget({
    target,
    title: 'Выбери игрока для кражи карты',
  });
  if (!finalTarget) {
    return;
  }

  card.markAsPlayed();

  if (!finalTarget.deck.length) {
    finalTarget.shuffleDiscardToDeck();
  }
  if (!finalTarget.deck.length) {
    return;
  }

  // Чужая карта
  const someonesElseCard = finalTarget.deck.splice(-1, 1)[0];
  if (someonesElseCard.permanent) {
    someonesElseCard.ownerNickname = player.nickname;
    someonesElseCard.tempOwnerNickname = undefined;
  } else {
    someonesElseCard.tempOwnerNickname = player.nickname;
  }
  player.takeCardsTo('hand', [someonesElseCard], [someonesElseCard]);
  room.logEvent(`Игрок ${player.nickname} позаимствовал карту у игрока ${finalTarget.nickname}`);
};

exports.default = handler;
