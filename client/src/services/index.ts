import { RoomNamespace } from './roomNamespace';

export class Services {
  roomNamespace: RoomNamespace = {} as RoomNamespace;

  initRoomNamespace(roomName: string, nickname: string) {
    this.roomNamespace = new RoomNamespace(roomName, nickname);
  }
}

export const services = new Services();
