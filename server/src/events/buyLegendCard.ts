import type { Room } from 'Entity/room';

import { getLastElement, getPropsExceptProps } from 'Helpers';

export const buyLegendCard = (room: Room) => {
  if (!room.activePlayer || room.gameEnded) {
    return;
  }
  const card = getLastElement(room.legends);
  if (!card) {
    return;
  }

  const cardTotalCost = card.getTotalCost(room.activePlayer);
  if (cardTotalCost > room.activePlayer.totalPower) {
    return;
  }
  room.activePlayer.takeCardsTo('discard', 1, room.legends);
  room.onCurrentTurn.powerWasted += cardTotalCost;

  // Возвращаю свойства по легенде 12
  room.playersArray.forEach(player => {
    const tempProps = player.props.filter(prop => prop.temp);
    if (!tempProps.length) {
      return;
    }
    player.props = getPropsExceptProps(player.props, tempProps);
    tempProps.forEach(prop => {
      prop.temp = false;
      prop.ownerNickname = undefined;
    });
    room.props.push(...tempProps);
  });
  room.logEvent(`Игрок ${room.activePlayer.nickname} купил легенду`);
  room.sendInfo();

  if (!room.legends.length) {
    room.endGame();
  }
};
