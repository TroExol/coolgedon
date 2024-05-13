import { ECardTypes } from '@coolgedon/shared';

import type { TPlayCardHandler } from 'Type/events/playCard';

const handler: TPlayCardHandler = async ({
  player,
  markAsPlayed,
}) => {
  const stickInHand = player.getCard('hand', ECardTypes.sluggishStick);
  const stickInDiscard = player.getCard('discard', ECardTypes.sluggishStick);

  player.takeCardsTo('hand', 1, player.deck);

  if (!stickInHand && !stickInDiscard) {
    markAsPlayed?.();
    return;
  }

  const variants = [];
  if (stickInHand) {
    variants.push({ id: 1, value: 'Из руки' });
  }
  if (stickInDiscard) {
    variants.push({ id: 2, value: 'Из сброса' });
  }
  if (stickInHand && stickInDiscard) {
    variants.push({ id: 3, value: 'Из руки и сброса' });
  }
  const selectedVariant = await player.selectVariant<number>({
    title: 'Можешь уничтожить вялую пялочку',
    variants: variants,
  });

  if (!selectedVariant) {
    markAsPlayed?.();
    return;
  }

  if ([1, 3].includes(selectedVariant)) {
    await player.removeCards([stickInHand!], 'hand');
  }
  if ([2, 3].includes(selectedVariant)) {
    await player.removeCards([stickInDiscard!], 'discard');
  }
  markAsPlayed?.();
};

exports.default = handler;
