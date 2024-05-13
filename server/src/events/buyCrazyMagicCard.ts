import type { Room } from 'Entity/room';

export const buyCrazyMagicCard = (room: Room) => {
  if (!room.activePlayer || room.gameEnded || !room.crazyMagic.length) {
    return;
  }
  const card = room.crazyMagic[0];
  const cardTotalCost = card.getTotalCost(room.activePlayer);
  if (cardTotalCost > room.activePlayer.totalPower) {
    return;
  }
  room.activePlayer.takeCardsTo('discard', 1, room.crazyMagic);
  room.onCurrentTurn.powerWasted += cardTotalCost;
  room.logEvent(`Игрок ${room.activePlayer.nickname} купил карту шальную магию`);
  room.sendInfo();
};
