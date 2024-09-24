import { EEventTypes } from '@coolgedon/shared';

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
  room.sendInfo();
  room.emitToPlayers(room.playersArray, EEventTypes.showModalCards, {
    cards: [someonesElseCard.format()],
    title: `Игрок ${player.nickname} шалит картой игрока ${finalTarget.nickname}`,
  });
  if (someonesElseCard.permanent) {
    someonesElseCard.ownerNickname = player.nickname;
    player.takeCardsTo('hand', [someonesElseCard], [someonesElseCard]);
    room.logEvent(`Игрок ${player.nickname} забрал постоянку у игрока ${finalTarget.nickname}`);
    return;
  }
  try {
    someonesElseCard.tempOwnerNickname = player.nickname;
    await someonesElseCard.play({ type: 'simple', params: { cardUsedByPlayer: true } });
    room.logEvent(`Игрок ${player.nickname} разыграл карту игрока ${finalTarget.nickname}`);
  } catch (error) {
    console.error('Ошибка разыгрывания карты шальной магией', error);
  } finally {
    someonesElseCard.tempOwnerNickname = undefined;
    finalTarget.discard.push(someonesElseCard);
    someonesElseCard.played = false;
    someonesElseCard.playing = false;
    room.sendInfo();
  }
};

exports.default = handler;
