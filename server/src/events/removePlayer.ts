import type { Room } from 'Entity/room';

import { endTurn } from 'Event/endTurn';
import { rooms } from 'Entity/room';
import { wsClients } from 'Entity/room';

interface TRemovePlayerParams {
  room: Room;
  nickname: string;
}

export const removePlayer = ({ room, nickname }: TRemovePlayerParams) => {
  if ((room.playersArray.length === 1 && nickname === room.playersArray[0].nickname) || !room.playersArray.length) {
    delete rooms[room.name];
    delete wsClients[room.name];
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
  const wsClient = room.getWsClient(nickname);
  if (wsClient) {
    wsClient.close(1000, 'Вас исключили');
    delete wsClients[room.name][nickname];
  }
  delete room.players[nickname];
  room.logEvent(`Игрок ${nickname} удален из игры`);
  room.sendInfo();
};
