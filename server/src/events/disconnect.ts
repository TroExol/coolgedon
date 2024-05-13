import type { WebSocket } from 'ws';

import type { Room } from 'Entity/room';

import { wsClients } from 'Entity/room';

interface TDisconnectParams {
  room: Room;
  nickname: string;
  ws: WebSocket;
}

export const disconnect = ({ room, nickname, ws }: TDisconnectParams) => {
  if (!nickname || !room) {
    return;
  }
  const wsClient = room.getWsClient(nickname);
  if (wsClient && wsClient === ws) {
    // const pinged = false;
    // wsSendMessageAsync(room, nickname, { event: EEvent.ping })
    //   .then(() => pinged = true)
    //   .catch((error) => {
    //     console.error('disconnect ping ошибка', error);
    //     delete wsClients[room][nickname]
    //   });
    // sleep(5000);
    // if (!pinged) {
    room.logEvent(`Игрок ${nickname} отключился`);
    delete wsClients[room.name][nickname];
    // }
  }
};
