import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  room,
  player,
  target,
  byLawlessness,
  markAsPlayed,
}) => {
  if (byLawlessness) {
    return;
  }
  const finalTarget = await player.selectTarget({
    target,
    title: 'Выбери игрока для получения палочки',
  });

  if (!finalTarget) {
    return;
  }

  finalTarget.takeCardsTo('discard', 1, room.sluggishStick);
  markAsPlayed?.();
};

exports.default = handler;
