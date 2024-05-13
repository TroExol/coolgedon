import type { TPlayLawlessnessHandlerParams } from 'Type/events/playCard';

exports.default = async function ({
  room,
  card,
}: TPlayLawlessnessHandlerParams) {
  const leftPlayer = room.getPlayerByPos(room.activePlayer, 'left');
  if (!leftPlayer) {
    return;
  }
  const canAttack = await leftPlayer.guard({
    cardAttack: card,
    title: 'Будете защищаться от беспредела?',
    byLawlessness: true,
  });
  if (!canAttack) {
    return;
  }
  leftPlayer.takeCardsTo('hand', 2, leftPlayer.deck);
};
