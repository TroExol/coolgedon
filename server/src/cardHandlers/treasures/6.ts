import type { TPlayCardHandler } from 'Type/events/playCard';

import { toPlayerVariant } from 'Helpers';

interface TCardData {
  description: string;
  from: 'hand' | 'discard';
}

const handler: TPlayCardHandler = async ({
  room,
  card,
  canGuard,
  target,
  player,
  cardUsedByPlayer,
  byLawlessness,
  markAsPlayed,
}) => {
  if (byLawlessness) {
    return;
  }

  if (cardUsedByPlayer) {
    player.takeCardsTo('hand', 1, player.deck);
  }

  const cardsToSelect = [
    ...player.hand
      .filter(handCard => handCard.getTotalCost(player) === 0)
      .map(handCard => {
        handCard.data = { description: 'Из руки', from: 'hand' };
        return handCard;
      }),
    ...player.discard
      .filter(discardCard => discardCard.getTotalCost(player) === 0)
      .map(discardCard => {
        discardCard.data = { description: 'Из сброса', from: 'discard' };
        return discardCard;
      }),
  ];

  const finalTargets = target
    ? [target]
    : room.getPlayersExceptPlayer(player);

  const selected = await player.selectCards({
    cards: cardsToSelect,
    variants: finalTargets.map(toPlayerVariant),
    title: 'Отдай 1 карту выбранному врагу на руку',
    canClose: false,
  });

  const finalTarget = room.getPlayer(selected.variant as string);

  if (canGuard) {
    const canAttack = await finalTarget.guard({
      cardsToShow: selected.cards,
      attacker: player,
      cardAttack: card,
      title: `Игрок ${player.nickname} собирается отдать вам на руку карту, будете защищаться?`,
      byLawlessness,
    });
    if (!canAttack) {
      markAsPlayed?.();
      return;
    }
  }

  const from = (selected.cards[0].data as TCardData).from;
  selected.cards.forEach(c => {
    c.data = undefined;
  });
  finalTarget.takeCardsTo('hand', selected.cards, player[from]);
  room.logEvent(`Игрок ${player.nickname} отдал карту на руку игроку ${finalTarget.nickname}`);
  markAsPlayed?.();
};

exports.default = handler;
