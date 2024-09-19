import { ECardTypes } from '@coolgedon/shared';

import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import { playTower } from 'Event/playTower';
import { type Room, getEmptyOnCurrentTurn } from 'Entity/room';

const discardCard = (player: Player, card: Card) => {
  if (card.theSameType(ECardTypes.familiars, 7)) {
    player.deck.unshift(card);
  } else {
    player.discard.push(card);
  }
};

const returnCardsToOwner = (room: Room) => {
  // Возврат заимствованной карты
  for (let i = room.activePlayer.hand.length - 1; i >= 0; i--) {
    const card = room.activePlayer.hand[i];
    if (!card.tempOwnerNickname || !card.ownerNickname) {
      continue;
    }
    card.played = false;
    card.playing = false;
    card.tempOwnerNickname = undefined;
    room.activePlayer.hand.splice(i, 1);
    const owner = room.getPlayer(card.ownerNickname);
    discardCard(owner, card);
  }
  for (let i = room.activePlayer.deck.length - 1; i >= 0; i--) {
    const card = room.activePlayer.deck[i];
    if (!card.tempOwnerNickname || !card.ownerNickname) {
      continue;
    }
    card.played = false;
    card.playing = false;
    card.tempOwnerNickname = undefined;
    room.activePlayer.deck.splice(i, 1);
    const owner = room.getPlayer(card.ownerNickname);
    discardCard(owner, card);
  }
  for (let i = room.activePlayer.discard.length - 1; i >= 0; i--) {
    const card = room.activePlayer.discard[i];
    if (!card.tempOwnerNickname || !card.ownerNickname) {
      continue;
    }
    card.played = false;
    card.playing = false;
    card.tempOwnerNickname = undefined;
    room.activePlayer.discard.splice(i, 1);
    const owner = room.getPlayer(card.ownerNickname);
    discardCard(owner, card);
  }
};

const resetPlayerCards = (room: Room) => {
  room.activePlayer.allCards.forEach(card => {
    card.played = false;
    card.playing = false;
  });
  room.activePlayer.hand.forEach(card => {
    if (card.theSameType(ECardTypes.familiars, 7)) {
      room.activePlayer.deck.unshift(card);
    } else {
      room.activePlayer.discard.push(card);
    }
  });
  room.activePlayer.hand = [];
  room.activePlayer.fillHand();
};

const resetPlayerProps = (room: Room) => {
  room.activePlayer.props.forEach(prop => {
    prop.played = false;
  });
};

export const endTurn = async (room: Room, removeActivePlayer?: boolean) => {
  try {
    if (!room.activePlayer || room.playersArray.length <= 1 || room.gameEnded) {
      return;
    }

    returnCardsToOwner(room);

    if (!removeActivePlayer) {
      resetPlayerCards(room);
      resetPlayerProps(room);
      const prop3 = room.activePlayer.getProp(3);
      const countBoughtOrReceivedWizards = room.onCurrentTurn.boughtOrReceivedCards[ECardTypes.wizards]?.length || 0;
      if (prop3 && countBoughtOrReceivedWizards) {
        await prop3.play();
      }
    }

    const prevActivePlayer = room.activePlayer;
    const leftPlayer = room.getPlayerByPos(prevActivePlayer, 'left');
    if (!leftPlayer) {
      return;
    }

    room.onCurrentTurn = getEmptyOnCurrentTurn();
    room.wasLawlessnessesOnCurrentTurn = false;
    room.changeActivePlayer(leftPlayer);
    room.logEvent(`Игрок ${prevActivePlayer.nickname} закончил ход`);
    room.sendInfo();

    if (!removeActivePlayer && prevActivePlayer.hasTower) {
      await playTower({ room, player: prevActivePlayer });
    }
  } catch (error) {
    console.error('Ошибка окончания хода', error);
  }
};
