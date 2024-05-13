import type { Room } from 'Entity/room';

export const buyFamiliarCard = (room: Room) => {
  if (!room.activePlayer?.familiarToBuy || room.gameEnded) {
    return;
  }
  const card = room.activePlayer.familiarToBuy;
  const cardTotalCost = card.getTotalCost(room.activePlayer);
  if (cardTotalCost > room.activePlayer.totalPower) {
    return;
  }
  room.activePlayer.discard.push(card);
  room.onCurrentTurn.powerWasted += cardTotalCost;
  room.activePlayer.familiarToBuy = null;
  room.logEvent(`Игрок ${room.activePlayer.nickname} купил фамильяра`);
  room.sendInfo();
};
