import { EEventTypes, EModalTypes } from '@coolgedon/shared';

import type { TPlayCardHandler } from 'Type/events/playCard';
import type { Card } from 'Entity/card';

const handler: TPlayCardHandler = async ({
  room,
  card,
  canGuard,
  target,
  player,
  attacker,
  damage,
  byLawlessness,
  markAsPlayed,
}) => {
  const finalTarget = await player.selectTarget({ target });
  if (!finalTarget) {
    return;
  }

  if (!finalTarget.deck.length) {
    finalTarget.shuffleDiscardToDeck();
  }
  if (!finalTarget.deck.length) {
    markAsPlayed?.();
    return;
  }

  const finalDamage = card.getFinalDamage({
    concreteDamage: damage,
    target: finalTarget,
    attacker,
  });
  const topDeckCard: Card | undefined = finalTarget.deck.slice(-1)[0];

  if (!finalDamage) {
    if (topDeckCard) {
      room.wsSendMessage({
        event: EEventTypes.showModal,
        data: {
          modalType: EModalTypes.cards,
          cards: [topDeckCard.format()],
          title: `Верхняя карта в колоде игрока ${finalTarget.nickname}`,
          select: false,
        },
      }, room.playersArray);
    }
    markAsPlayed?.();
    return;
  }

  if (canGuard) {
    const canAttack = await finalTarget.guard({
      attacker,
      cardAttack: card,
      cardsToShow: [topDeckCard],
      title: byLawlessness
        ? `Беспредел атакует на ${finalDamage} урона, будете защищаться?`
        : `Игрок ${attacker.nickname} собирается нанести вам ${finalDamage} урона, будете защищаться?`,
      byLawlessness,
      damage: finalDamage,
    });
    if (!canAttack) {
      markAsPlayed?.();
      return;
    }
  }

  finalTarget.damage({
    damage: finalDamage,
    attacker,
  });
  markAsPlayed?.();

  room.wsSendMessage({
    event: EEventTypes.showModal,
    data: {
      modalType: EModalTypes.cards,
      cards: [topDeckCard.format()],
      title: `Верхняя карта в колоде игрока ${finalTarget.nickname}`,
      select: false,
    },
  }, room.playersArray);
};

exports.default = handler;
