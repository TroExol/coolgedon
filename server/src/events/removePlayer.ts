import { EEventTypes, EMessage } from '@coolgedon/shared';

import type { Room } from 'Entity/room';

import { removeRoom } from 'Event/removeRoom';
import { endTurn } from 'Event/endTurn';

interface TRemovePlayerParams {
  room: Room;
  nickname: string;
}

export const removePlayer = ({ room, nickname }: TRemovePlayerParams) => {
  if ((room.playersArray.length === 1 && nickname === room.playersArray[0].nickname) || !room.playersArray.length) {
    removeRoom(room);
    return;
  }
  const playerToRemove = room.getPlayer(nickname);
  if (!playerToRemove) {
    return;
  }

  const leftPlayer = room.getPlayerByPos(playerToRemove, 'left');
  if (leftPlayer) {
    if (room.activePlayer?.nickname === nickname) {
      void endTurn(room, true);
    }
    if (room.admin.nickname === nickname) {
      room.changeAdmin(leftPlayer);
    }
  }
  const socketClient = room.getSocketClient(nickname);
  if (socketClient) {
    room.emitToPlayers([playerToRemove], EEventTypes.sendMessage, EMessage.kicked);
    socketClient.disconnect();
    room.removePlayerSocket(nickname);
  }
  delete room.players[nickname];
  room.logEvent(`Игрок ${nickname} удален из игры`);
  room.sendInfo();
};
