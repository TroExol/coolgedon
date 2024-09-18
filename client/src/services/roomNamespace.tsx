/* eslint-disable no-console */
import type { Socket } from 'socket.io-client';

import { io } from 'socket.io-client';
import {
  getCardsComponent,
  getEndGameComponent,
  getLeftUniqueCardTypesComponent,
  getPlayCardComponent,
  getSelectCardsComponent,
  getSelectGuardCardComponent,
  getSelectSkullsComponent,
  getSelectStartCardsComponent,
  getSelectVariantComponent,
} from 'Service/wsHandlers/showModal';
import {
  EEventTypes, EMessage, type TClientToServerEvents, type TServerToClientEvents,
} from '@coolgedon/shared';

import { store } from 'Store';

export class RoomNamespace {
  reconnectTries = 0;

  socket: Socket<TServerToClientEvents, TClientToServerEvents>;

  constructor(roomName: string, nickname: string) {
    if (process.env.NODE_ENV === 'development') {
      this.socket = io(
        `http://192.168.0.171:4001/room-${roomName}`,
        { query: { nickname } },
      );
    } else {
      this.socket = io(`https://troexol.ru/room-${roomName}`, { query: { nickname } });
    }

    this.socket.on('connect', () => {
      console.log('Подключение установлено');
    });

    this.socket.on('connect_error', error => {
      console.error('Ошибка соединения с сервером', error);
      // eslint-disable-next-line no-alert
      alert(`Ошибка соединения с сервером: ${error.message}`);
    });

    this.socket.on('disconnect', (reason, details) => {
      if (!this.socket.active) {
        console.log('Соединение разорвано', reason, details);
      }
    });

    this.socket.on(EEventTypes.updateInfo, params => {
      if (!store.initedRoom) {
        store.initRoom(params);
      } else {
        store.roomStore.update(params);
      }
    });

    this.socket.on(EEventTypes.sendLogs, params => {
      if (!store.initedLogs) {
        store.initLogs(params);
      } else {
        store.logsStore.update(params);
      }
    });

    this.socket.on(EEventTypes.sendMessage, message => {
      // eslint-disable-next-line no-alert
      alert(message);
      if ([EMessage.kicked, EMessage.roomRemoved].includes(message)) {
        window.location.reload();
      }
    });

    this.socket.on(EEventTypes.showModalSelectStartCards, (params, callback) => {
      const content = getSelectStartCardsComponent({ callback, ...params });

      store.modalsStore.show(content, {
        canClose: false,
        canCollapse: false,
      });
    });

    this.socket.on(EEventTypes.showModalSelectCards, (params, callback) => {
      const content = getSelectCardsComponent({ callback, ...params });

      const onClose = () => {
        callback({ closed: true });
      };

      store.modalsStore.show(content, {
        canClose: params.canClose,
        canCollapse: params.canCollapse,
        onClose,
      });
    });

    this.socket.on(EEventTypes.showModalCards, params => {
      const content = getCardsComponent(params);

      store.modalsStore.show(content, {
        canClose: params.canClose,
        canCollapse: params.canCollapse,
      });
    });

    this.socket.on(EEventTypes.showModalPlayCard, (params, callback) => {
      const content = getPlayCardComponent({ callback, ...params });

      const onClose = () => {
        callback();
      };

      store.modalsStore.show(content, {
        canClose: params.canClose,
        canCollapse: params.canCollapse,
        onClose,
      });
    });

    this.socket.on(EEventTypes.showModalSuggestGuard, (params, callback) => {
      const content = getSelectGuardCardComponent({ callback, ...params });

      const onClose = () => {
        callback({ closed: true });
      };

      store.modalsStore.show(content, {
        canClose: params.canClose,
        canCollapse: params.canCollapse,
        onClose,
      });
    });

    this.socket.on(EEventTypes.showModalLeftUniqueCardTypes, (params, callback) => {
      const content = getLeftUniqueCardTypesComponent({ callback, ...params });

      const onClose = () => {
        callback({ closed: true });
      };

      store.modalsStore.show(content, {
        canClose: params.canClose,
        canCollapse: params.canCollapse,
        onClose,
      });
    });

    this.socket.on(EEventTypes.showModalEndGame, params => {
      const content = getEndGameComponent(params);

      store.modalsStore.show(content, {
        canClose: params.canClose,
        canCollapse: params.canCollapse,
      });
    });

    this.socket.on(EEventTypes.showModalSelectSkulls, (params, callback) => {
      const content = getSelectSkullsComponent({ callback, ...params });

      const onClose = () => {
        callback({ closed: true });
      };

      store.modalsStore.show(content, {
        canClose: params.canClose,
        canCollapse: params.canCollapse,
        onClose,
      });
    });

    this.socket.on(EEventTypes.showModalSelectVariant, (params, callback) => {
      const content = getSelectVariantComponent({ callback, ...params });

      const onClose = () => {
        callback({ closed: true });
      };

      store.modalsStore.show(content, {
        canClose: params.canClose,
        canCollapse: params.canCollapse,
        onClose,
      });
    });
  }
}
