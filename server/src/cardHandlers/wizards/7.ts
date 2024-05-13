import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  player,
  markAsPlayed,
}) => {
  const selectedTarget = await player.selectTarget({
    title: 'Кто возьмет карту?',
    canClose: false,
  });

  if (!selectedTarget) {
    return;
  }

  player.takeCardsTo('hand', 1, player.deck);
  selectedTarget.takeCardsTo('hand', 1, selectedTarget.deck);
  markAsPlayed?.();
};

exports.default = handler;
