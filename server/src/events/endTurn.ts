import { ECardTypes } from '@coolgedon/shared';

import type { Player } from 'Entity/player';

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

const resetPlayerCards = (room: Room) => {
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

    const prevActivePlayer = room.activePlayer;
    const leftPlayer = room.getPlayerByPos(prevActivePlayer, 'left');
    if (!leftPlayer) {
      return;
    }

    if (!removeActivePlayer) {
      resetPlayerCards(room);
      resetPlayerProps(room);
      const prop3 = room.activePlayer.getProp(3);
      if (prop3) {
        await prop3.play();
      }
    }

    room.playersArray.forEach(player => player.allCards.forEach(card => {
      card.played = false;
      card.playing = false;
    }));

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
