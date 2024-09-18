import { EEventTypes, EMessage } from '@coolgedon/shared';

import { type Room, rooms } from 'Entity/room';

export const removeRoom = (room: Room) => {
  room.emitToPlayers(room.getPlayersExceptPlayer(room.admin), EEventTypes.sendMessage, EMessage.roomRemoved);
  room.close();
  delete rooms[room.name];
};
