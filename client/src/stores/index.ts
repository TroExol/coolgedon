import type { TLog, TRoom } from '@coolgedon/shared';

import { makeAutoObservable } from 'mobx';

import { RoomStore } from './room';
import { previewStore } from './preview';
import { modalsStore } from './modals';
import { LogsStore } from './logs';

// interface TStore {
//   initedRoom: boolean;
//   initedLogs: boolean;
//   roomStore: RoomStore;
//   modalsStore: ModalsStore;
//   previewStore: PreviewStore;
//   logsStore: LogsStore;
// }

// const store = {
//   initedRoom: false,
//   initedLogs: false,
//   modalsStore,
//   previewStore,
// } as TStore;

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

  setInitedLogs(value: boolean) {
    this.initedLogs = value;
  }

  setInitedRoom(value: boolean) {
    this.initedRoom = value;
  }
}

export const store = new Store();

// export const initRoom = (data: TRoom) => {
//   try {
//     const myNickname = localStorage.getItem('nickname') as string;
//     store.roomStore = new RoomStore(data, myNickname);
//     store.initedRoom = true;
//   } catch (error) {
//     // eslint-disable-next-line no-console
//     console.error(`Не удалось инициализировать комнату: ${error}`);
//   }
// };
//
// export const initLogs = (data: TLog[]) => {
//   store.logsStore = new LogsStore(data);
//   store.initedLogs = true;
// };

// const StoreContext = createContext({
//   store,
//   initedRoom: false,
//   initedLogs: false,
//   initRoom,
//   initLogs,
// });

// export const StoreProvider = observer(({ children }) => {
//   const [initedRoom, setInitedRoom] = useState(false);
//   const [initedLogs, setInitedLogs] = useState(false);
//   const initLogs = (data: TLog[]) => {
//     store.logsStore = new LogsStore(data);
//     store.initedLogs = true;
//   };
//
//   return (
//     <StoreContext.Provider
//       value={{
//         store,
//         initedRoom,
//         initedLogs,
//         initRoom,
//         initLogs,
//       }}
//     >
//       {children}
//     </StoreContext.Provider>
//   );
// });
//
// export const useStore = () => useContext(StoreContext);
