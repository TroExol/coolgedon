import type { TPlayLawlessnessHandlerParams } from 'Type/events/playCard';

exports.default = async function ({
  room,
  player,
}: TPlayLawlessnessHandlerParams) {
  const rightPlayer = room.getPlayerByPos(player, 'right');
  if (!rightPlayer) {
    return;
  }

  if (rightPlayer.hand.length) {
    const selected = await rightPlayer.selectCards({
      cards: rightPlayer.hand,
      variants: [{ id: 1, value: 'Уничтожить' }],
      title: 'Можешь уничтожить 1 карту у себя на руке',
    });

    if (!selected.cards) {
      return;
    }
    await rightPlayer.removeCards(selected.cards, 'hand');
  }

  if (rightPlayer.discard.length) {
    const selected = await rightPlayer.selectCards({
      cards: rightPlayer.discard,
      variants: [{ id: 1, value: 'Уничтожить' }],
      title: 'Можешь уничтожить 1 карту у себя в сбросе',
    });

    if (!selected.cards) {
      return;
    }
    await rightPlayer.removeCards(selected.cards, 'discard');
  }
};
