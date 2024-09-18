import type { TLog, TRoom } from '@coolgedon/shared';

import { makeAutoObservable } from 'mobx';

import { RoomStore } from './room';
import { previewStore } from './preview';
import { modalsStore } from './modals';
import { LogsStore } from './logs';

export class Store {
  initedLogs = false;
  initedRoom = false;
  logsStore: LogsStore = {} as LogsStore;
  modalsStore = modalsStore;
  previewStore = previewStore;
  roomStore: RoomStore = {} as RoomStore;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  initLogs(data: TLog[]) {
    this.logsStore = new LogsStore(data);
    this.initedLogs = true;
  }

  initRoom(data: TRoom) {
    try {
      this.roomStore = new RoomStore(data);
      this.initedRoom = true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Не удалось инициализировать комнату: ${error}`);
    }
  }
}

export const store = new Store();
