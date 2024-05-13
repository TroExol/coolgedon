import type { TPlayGuardHandlerParams } from 'Event/playGuard';

exports.default = async function ({
  room,
  target,
  attacker,
}: TPlayGuardHandlerParams) {
  target.takeCardsTo('hand', 1, target.deck);

  if (!attacker) {
    return;
  }
  attacker.takeCardsTo('discard', 1, room.sluggishStick);
};
