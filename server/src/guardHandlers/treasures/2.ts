import type { TPlayGuardHandlerParams } from 'Event/playGuard';

exports.default = async function ({
  target,
}: TPlayGuardHandlerParams) {
  target.takeCardsTo('hand', 1, target.deck);
};
