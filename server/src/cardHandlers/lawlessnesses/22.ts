import type { TPlayLawlessnessHandlerParams } from 'Type/events/playCard';

exports.default = async function ({
  room,
}: TPlayLawlessnessHandlerParams) {
  room.playersArray.forEach(player => {
    player.discard.push(
      ...player.hand.splice(0),
      ...player.deck.splice(0),
    );
    player.fillHand();
  });
};
