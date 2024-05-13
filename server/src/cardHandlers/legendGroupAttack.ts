import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import { getCountCardsIn } from 'Helpers';

interface TLegendGroupAttackParams {
  room: Room;
  target?: Player;
  card: Card;
  byLawlessness?: boolean;
}

export const legendGroupAttack = async ({
  room,
  card,
  // На кого разыгрывают, например, если это по свойству жетона
  target,
  byLawlessness,
}: TLegendGroupAttackParams) => {
  const totalTargets = target
    ? [target]
    : room.playersArray;

  await Promise.allSettled(totalTargets.map(async currentTarget => {
    if (!card.canPlayGroupAttack(currentTarget)) {
      return;
    }

    const canAttack = await currentTarget.guard({
      cardAttack: card,
      title: 'Будете защищаться от групповой атаки?',
      byLawlessness,
    });
    if (!canAttack) {
      return;
    }

    switch (card.number) {
      case 2: {
        const selectedCards = await currentTarget.selectLeftUniqueCardTypes({
          cards: currentTarget.hand,
          canClose: false,
        });

        if (!selectedCards) {
          return;
        }

        const cardsToRemove = currentTarget.hand
          .filter(handCard => !selectedCards.some(c => handCard.id === c.id));
        await currentTarget.removeCards(cardsToRemove, 'hand');
        break;
      }
      case 3:
        currentTarget.damage({ damage: 5 });
        currentTarget.takeCardsTo('discard', 1, room.sluggishStick);
        break;
      case 4: {
        const countCards = currentTarget.hand
          .filter(handCard => handCard.getTotalCost(currentTarget) >= 4).length;
        currentTarget.takeCardsTo('discard', countCards, room.sluggishStick);
        break;
      }
      case 5: {
        const damage = currentTarget.hand
          .filter(handCard => handCard.getTotalVictoryPoints(currentTarget) >= 1).length * 3;
        currentTarget.damage({ damage });
        break;
      }
      // case 6:
      //   if (currentTarget.hand.length) {
      //     const selected = await currentTarget.selectCards({
      //       cards: currentTarget.hand,
      //       variants: [{ id: 1, value: 'Сбросить' }],
      //       title: 'Сбрось до 2-ух карт со своей руки',
      //       count: 2,
      //       canClose: false,
      //     });
      //     currentTarget.discardCards(selected.cards, 'hand');
      //   }
      //
      //   if (currentTarget.activePermanent.length) {
      //     const selected = await currentTarget.selectCards({
      //       cards: currentTarget.activePermanent,
      //       variants: [{ id: 1, value: 'Сбросить' }],
      //       title: 'Сбрось свою постоянку',
      //       canClose: false,
      //     });
      //     currentTarget.discardCards(selected.cards, 'activePermanent');
      //   }
      //   break;
      case 7:
        currentTarget.damage({ damage: 7 });
        break;
      case 8: {
        if (currentTarget.deck.length < 5) {
          currentTarget.shuffleDiscardToDeck();
        }
        if (!currentTarget.deck.length) {
          return;
        }
        const cardsFromDeck = currentTarget.deck.slice(-5);
        const cardsToDiscard = cardsFromDeck.filter(deckCard => deckCard.getTotalCost(currentTarget) >= 1);
        currentTarget.discardCards(cardsToDiscard, 'deck');
        break;
      }
      case 10: {
        const countCreatures = getCountCardsIn(room.shop, ECardTypes.creatures);
        currentTarget.takeCardsTo('discard', countCreatures, room.sluggishStick);
        break;
      }
      case 11: {
        const cardsToDiscard = currentTarget.hand.filter(handCard => handCard.getTotalCost(currentTarget) >= 5);
        currentTarget.discardCards(cardsToDiscard, 'hand');
        break;
      }
      case 12: {
        const minHp = room.playersArray
          .reduce((min, p) => min > p.hp ? p.hp : min, 999);
        currentTarget.hp = minHp;
        room.sendInfo();
        room.logEvent(`Здоровье игрока ${currentTarget.nickname} стало равно ${minHp}`);
        break;
      }
      default:
        console.error(`Групповая атака: не найден обработчик карты ${card.type} ${card.number}`);
    }
  }));
};
