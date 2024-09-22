import type { Skull } from 'Entity/skull';
import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';

import { getLastElement, getRandomElements, toPlayerVariant } from 'Helpers';

export interface TPlaySkullParams {
  room: Room;
  skull: Skull;
  attacker?: Player;
}

// TODO: перенести в Skull
export const playSkull = async ({
  room,
  attacker,
  skull,
}: TPlaySkullParams) => {
  try {
    if (room.gameEnded) {
      return;
    }

    const skullOwner = skull.owner!;
    const otherPlayers = room.getPlayersExceptPlayer(skullOwner);

    switch (skull.id) {
      case 1:
        if (!room.sluggishStick.length) {
          return;
        }
        skullOwner.takeCardsTo('discard', 2, room.sluggishStick);
        room.logEvent(`Игрок ${skullOwner.nickname} разыграл жетон дохлого колдуна`);
        break;
      case 2: {
        if (!skullOwner.hand.length) {
          return;
        }
        const randCards = getRandomElements(skullOwner.hand, 2);
        skullOwner.discardCards(randCards, 'hand');
        room.logEvent(`Игрок ${skullOwner.nickname} разыграл жетон дохлого колдуна`);
        break;
      }
      case 3: {
        if (!skullOwner.discard.length) {
          return;
        }
        const selected = await skullOwner.selectCards({
          cards: skullOwner.discard,
          variants: [{
            id: 1,
            value: 'Уничтожить',
          }],
          title: 'Выбери карту из своего сброса для уничтожения',
          canClose: false,
        });
        await skullOwner.removeCards(selected.cards, 'discard');
        room.logEvent(`Игрок ${skullOwner.nickname} разыграл жетон дохлого колдуна`);
        break;
      }
      case 4: {
        const card = getLastElement(room.legends);
        if (!card) {
          return;
        }
        await card.play({
          type: 'groupAttack',
          params: { target: skullOwner },
        });
        room.logEvent(`Игрок ${skullOwner.nickname} разыграл жетон дохлого колдуна`);
        break;
      }
      case 5: {
        if (!skullOwner.deck.length) {
          skullOwner.shuffleDiscardToDeck();
        }
        if (!skullOwner.deck.length) {
          return;
        }
        const cardsToTransfer = skullOwner.deck.slice(-1);
        const selected = await skullOwner.selectCards({
          cards: cardsToTransfer,
          variants: otherPlayers.map(toPlayerVariant),
          title: 'Кому передашь на руку эту карту?',
          count: 0,
          canClose: false,
        });
        if (typeof selected.variant !== 'string') {
          return;
        }
        const selectedPlayer = room.getPlayer(selected.variant);
        selectedPlayer.takeCardsTo('hand', cardsToTransfer, skullOwner.deck);
        room.logEvent(`Игрок ${skullOwner.nickname} передал игроку ${selectedPlayer.nickname} карту на руку`);
        room.logEvent(`Игрок ${skullOwner.nickname} разыграл жетон дохлого колдуна`);
        break;
      }
      case 6: {
        if (!skullOwner.discard.length) {
          return;
        }
        const randomCards = getRandomElements(skullOwner.discard, 1);
        await skullOwner.removeCards(randomCards, 'discard');
        room.logEvent(`Игрок ${skullOwner.nickname} разыграл жетон дохлого колдуна`);
        break;
      }
      case 7:
        for (const player of otherPlayers) {
          if (!player.discard.length) {
            continue;
          }
          player.selectCards({
            cards: player.discard,
            variants: [{
              id: 1,
              value: 'Передать',
            }],
            title: `Можешь передать карту из сброса в сброс игрока ${skullOwner.nickname}`,
          })
            .then(selected => {
              if (!selected.cards.length) {
                return;
              }
              skullOwner.takeCardsTo('discard', selected.cards, player.discard);
              room.logEvent(`Игрок ${player.nickname} передал игроку ${skullOwner.nickname} карту в сброс`);
            })
            .catch(error => console.error('Ошибка разыгрывания жетона', skull, error));
        }
        room.logEvent(`Игрок ${skullOwner.nickname} разыграл жетон дохлого колдуна`);
        break;
      case 8: {
        if (!skullOwner.hand.length) {
          return;
        }
        const selected = await skullOwner.selectCards({
          cards: skullOwner.hand,
          variants: [{
            id: 1,
            value: 'Сбросить',
          }],
          count: 3,
          title: 'Сбрось 3 карты из руки',
          canClose: false,
        });
        skullOwner.discardCards(selected.cards, 'hand');
        room.logEvent(`Игрок ${skullOwner.nickname} разыграл жетон дохлого колдуна`);
        break;
      }
      case 9:
        if (attacker) {
          attacker.damage({ damage: 8 });
          room.logEvent(`Игрок ${skullOwner.nickname} разыграл жетон дохлого колдуна`);
        }
        break;
      case 10:
        if (!room.sluggishStick.length) {
          return;
        }
        skullOwner.takeCardsTo('discard', 1, room.sluggishStick);
        room.logEvent(`Игрок ${skullOwner.nickname} разыграл жетон дохлого колдуна`);
        break;
      case 11: {
        if (!skullOwner.hand.length) {
          return;
        }
        const randomCards = getRandomElements(skullOwner.hand, 1);
        await skullOwner.removeCards(randomCards, 'hand');
        room.logEvent(`Игрок ${skullOwner.nickname} разыграл жетон дохлого колдуна`);
        break;
      }
      case 12:
        skullOwner.hp = 11;
        room.logEvent(`Игрок ${skullOwner.nickname} разыграл жетон дохлого колдуна`);
        room.sendInfo();
        break;
      case 13:
        if (!skullOwner.discard.length && !skullOwner.deck.length) {
          return;
        }
        skullOwner.takeCardsTo('hand', 1, skullOwner.deck);
        room.logEvent(`Игрок ${skullOwner.nickname} разыграл жетон дохлого колдуна`);
        break;
      case 14:
      case 15:
      case 16:
      case 17:
      case 18:
      case 19:
      case 20:
        break;
      default:
        console.error(`Нет обработчика жетона id ${skull.id}`);
    }
  } catch (error) {
    console.error('Ошибка разыгрывания жетона', skull, error);
  }
};
