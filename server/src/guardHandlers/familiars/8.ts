import type { TPlayGuardHandlerParams } from 'Event/playGuard';

exports.default = async function ({
  target,
  attacker,
  cardAttack,
  damage,
}: TPlayGuardHandlerParams) {
  target.takeCardsTo('hand', 1, target.deck);

  if (!attacker) {
    return;
  }
  void cardAttack.play({
    type: 'simple',
    params: {
      target: attacker,
      attacker: target,
      canGuard: false,
      damage,
    },
  });
  attacker.damage({ damage: 4, attacker: target });
};
