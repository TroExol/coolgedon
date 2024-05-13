import { type Room, rooms, wsClients } from 'Entity/room';

export const reset = (room: Room) => {
  delete rooms[room.name];
  delete wsClients[room.name];
};
