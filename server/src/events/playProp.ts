import type { Room } from 'Entity/room';
import type { Prop } from 'Entity/prop';
import type { Card } from 'Entity/card';

export interface TPlayPropParams {
  room: Room;
  prop: Prop;
  card?: Card;
}

// TODO: перенести в Prop
export const playProp = async ({
  room,
  prop,
  card,
}: TPlayPropParams) => {
  try {
    if (room.gameEnded || prop.played || prop.playing || !prop.owner || prop.owner !== room.activePlayer) {
      return;
    }
    const finalPlayer = prop.owner;

    switch (prop.id) {
      case 1: {
        if (!finalPlayer.discard.length) {
          return;
        }

        const selected = await finalPlayer.selectCards({
          cards: finalPlayer.discard,
          variants: [{ id: 1, value: 'Положить' }],
          title: 'Можешь переложить 1 карту из своего сброса на верх своей колоды',
        });
        if (!selected.cards.length) {
          return;
        }
        finalPlayer.takeCardsTo('deck', selected.cards, finalPlayer.discard);
        prop.markAsPlayed();
        break;
      }
      case 2:
        if (card) {
          finalPlayer.heal(card.getTotalVictoryPoints(finalPlayer));
          room.logEvent(`Игрок ${finalPlayer.nickname} разыграл свойство`);
        }
        break;
      case 3: {
        const countWizards = room.onCurrentTurn.boughtOrReceivedCards.wizards?.length || 0;
        if (!countWizards) {
          return;
        }
        finalPlayer.takeCardsTo('hand', countWizards, finalPlayer.deck);
        room.logEvent(`Игрок ${finalPlayer.nickname} разыграл свойство`);
        break;
      }
      case 4:
        prop.playing = true;
        finalPlayer.damage({ damage: 4 });
        finalPlayer.takeCardsTo('hand', 1, finalPlayer.deck);
        prop.markAsPlayed();
        break;
      case 5: {
        if (!finalPlayer.deck.length) {
          finalPlayer.shuffleDiscardToDeck();
        }
        if (!finalPlayer.deck.length) {
          return;
        }
        const cards = finalPlayer.deck.slice(-1);
        const selected = await finalPlayer.selectCards({
          cards,
          variants: [{ id: 1, value: 'Сбросить' }],
          title: 'Можешь сбросить верхнюю карту из своей колоды',
        });
        if (!selected.cards.length) {
          return;
        }
        finalPlayer.discardCards(selected.cards, 'deck');
        room.logEvent(`Игрок ${finalPlayer.nickname} разыграл свойство`);
        break;
      }
      case 6:
        finalPlayer.takeCardsTo('hand', 1, finalPlayer.deck);
        prop.markAsPlayed();
        break;
      case 7:
      case 8:
        break;
      default:
        console.error(`Нет обработчика свойства id ${prop.id}`);
    }
  } catch (error) {
    console.error('Ошибка разыгрывания свойства', card, error);
  } finally {
    prop.playing = false;
  }
};
