import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';

interface TPlayTowerParams {
  room: Room;
  player: Player;
}

export const playTower = async ({ room, player }: TPlayTowerParams) => {
  try {
    if (room.gameEnded || !player.hasTower || (!player.deck.length && !player.discard.length)) {
      return;
    }

    player.takeCardsTo('hand', 1, player.deck);
    const selected = await player.selectCards({
      cards: player.hand,
      variants: [{ id: 1, value: 'Сбросить' }],
      title: 'Сбросьте 1 карту из руки',
      canClose: false,
    });

    player.discardCards(selected.cards, 'hand');
  } catch (error) {
    console.error('Ошибка разыгрывания башни', error);
  }
};
