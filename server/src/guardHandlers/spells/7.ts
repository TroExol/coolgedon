import type { TPlayGuardHandlerParams } from 'Event/playGuard';

exports.default = async function ({
  attacker,
  target,
}: TPlayGuardHandlerParams) {
  target.takeCardsTo('hand', 1, target.deck);

  if (!attacker) {
    return;
  }
  attacker.damage({
    attacker: target,
    damage: 2,
  });
};
