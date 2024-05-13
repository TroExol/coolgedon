import { ECardTypes } from '@coolgedon/shared';

import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  room,
  player,
  byLawlessness,
  markAsPlayed,
}) => {
  if (byLawlessness) {
    return;
  }

  const treasures = player.getCards('discard', ECardTypes.treasures);

  if (!treasures.length) {
    room.onCurrentTurn.additionalPower += 2;
    markAsPlayed?.();
    return;
  }

  const selected = await player.selectCards({
    cards: treasures,
    variants: [{ id: 1, value: 'Взять' }],
    title: 'Возьми 1 сокровище из своего сброса',
  });

  if (!selected.cards.length) {
    return;
  }

  player.takeCardsTo('hand', selected.cards, player.discard);
  markAsPlayed?.();
};

exports.default = handler;
