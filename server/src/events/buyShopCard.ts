import type { Room } from 'Entity/room';
import type { Card } from 'Entity/card';

interface TBuyShopCardParams {
  room: Room;
  card: Card;
}

export const buyShopCard = async ({ room, card }: TBuyShopCardParams) => {
  try {
    if (!room.activePlayer || room.gameEnded || room.shop.indexOf(card) === -1) {
      return;
    }
    const cardTotalCost = card.getTotalCost(room.activePlayer);
    if (cardTotalCost > room.activePlayer.totalPower) {
      return;
    }
    const prop8 = room.activePlayer.getProp(8);
    if (prop8 && cardTotalCost <= 4) {
      room.activePlayer.takeCardsTo('deck', [card], [card]);
    } else {
      room.activePlayer.takeCardsTo('discard', [card], [card]);
    }
    room.onCurrentTurn.powerWasted += cardTotalCost;
    room.logEvent(`Игрок ${room.activePlayer.nickname} купил карту с барахолки`);
    await room.fillShop({ replaceCards: [card] });
  } catch (error) {
    console.error('Ошибка покупки карты', error);
  }
};
