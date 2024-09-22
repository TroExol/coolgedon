import { ECardTypes } from '@coolgedon/shared';

import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import { type Room, getEmptyOnCurrentTurn } from 'Entity/room';

export const playTower = async (room: Room, player: Player) => {
  try {
    if (room.gameEnded
      || !player.hasTower
      || (!player.deck.length && !player.discard.length)
      || player.playingTower) {
      return;
    }
    player.playingTower = true;

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
  } finally {
    player.playingTower = false;
  }
};

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
  room.activePlayer.fillHand(false);
};

const resetPlayerProps = (room: Room) => {
  room.activePlayer.props.forEach(prop => {
    prop.played = false;
  });
};

export const endTurn = async (room: Room, emitPlayerNickname: string, removeActivePlayer?: boolean) => {
  try {
    if (
      !room.activePlayer
      || room.playersArray.length <= 1
      || room.gameEnded
      || emitPlayerNickname !== room.activePlayer.nickname
    ) {
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
      await playTower(room, prevActivePlayer);
    }
  } catch (error) {
    console.error('Ошибка окончания хода', error);
  }
};
