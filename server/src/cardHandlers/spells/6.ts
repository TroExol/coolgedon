import { ECardTypes } from '@coolgedon/shared';

import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  room,
  player,
  markAsPlayed,
}) => {
  const creatures = player.getCards('discard', ECardTypes.creatures);

  if (!creatures.length) {
    room.onCurrentTurn.additionalPower += 2;
    markAsPlayed?.();
    return;
  }

  const selected = await player.selectCards({
    cards: creatures,
    variants: [{ id: 1, value: 'Взять' }],
    title: 'Возьми 1 тварь из своего сброса',
  });

  if (!selected.cards.length) {
    return;
  }

  player.takeCardsTo('hand', selected.cards, player.discard);
  markAsPlayed?.();
};

exports.default = handler;
