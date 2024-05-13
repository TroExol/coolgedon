import type { Room } from 'Entity/room';

export const playAllCards = async (room: Room) => {
  if (!room || !room.activePlayer) {
    return;
  }
  const cards = room.activePlayer.hand;
  for (let i = cards.length - 1; i >= 0; i--) {
    await cards[i].play({ type: 'simple', params: { cardUsedByPlayer: true } });
  }
};
