import { ECardTypes } from '@coolgedon/shared';

import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  room,
  player,
  markAsPlayed,
}) => {
  const topDeckCard = room.deck.slice(-1)[0];
  if (topDeckCard.theSameType(ECardTypes.lawlessnesses)) {
    room.removed.lawlessnesses.push(topDeckCard);
    room.deck.splice(-1);
    room.onCurrentTurn.additionalPower += 3;
    markAsPlayed?.();
    return;
  }

  player.takeCardsTo('deck', [topDeckCard], room.deck);
  room.logEvent(`Игрок ${player.nickname} взял карту в колоду из основной колоды`);
  markAsPlayed?.();
};

exports.default = handler;
