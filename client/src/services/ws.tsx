/* eslint-disable no-console */
import type { TEventSendFromClientParams, TEventSendFromServerParams } from '@coolgedon/shared';

import { showModalHandler } from 'Service/wsHandlers/showModal';
import { EEventTypes } from '@coolgedon/shared';

import type { DistributiveOmit } from 'Type/helperTypes';

import { store } from 'Store';

export class WS {
  reconnectTries = 0;

  socket?: WebSocket;

  constructor() {
    this.init();
  }

  init() {
    if (process.env.NODE_ENV === 'development') {
      this.socket = new WebSocket('ws://localhost:4001');
    } else {
      this.socket = new WebSocket('wss://troexol.ru/ws/');
    }

    this.socket.onopen = () => {
      console.log('Подключение установлено');
      this.reconnectTries = 0;
    };

    this.socket.onclose = event => {
      if (!event.wasClean) {
        console.info('Обрыв соединения', event); // например, "убит" процесс сервера
        if (this.reconnectTries > 20) {
          return;
        }
        setTimeout(() => this.init(), this.reconnectTries++ * 1000 * 2);
      }
      if (event.reason) {
        // eslint-disable-next-line no-alert
        alert(event.reason);
      }
    };

    this.socket.onmessage = event => {
      const parsed: TEventSendFromServerParams = JSON.parse(event.data);

      if (parsed.event === EEventTypes.updateInfo) {
        if (!store.roomStore?.myNickname) {
          store.initRoom(parsed.data);
        } else {
          store.roomStore.update(parsed.data);
        }
      } else if (parsed.event === EEventTypes.showModal) {
        if (!parsed.requestId) {
          return;
        }
        showModalHandler({
          requestId: parsed.requestId,
          data: parsed.data,
        });
      } else if (parsed.event === EEventTypes.ping) {
        if (!parsed.requestId) {
          return;
        }
        this.sendMessage({ requestId: parsed.requestId });
      } else if (parsed.event === EEventTypes.sendLogs) {
        if (!store.logsStore?.logs) {
          store.initLogs(parsed.data);
        } else {
          store.logsStore.update(parsed.data);
        }
      }
    };
  }

  sendMessage(msg: DistributiveOmit<TEventSendFromClientParams, 'roomName'> & Partial<TEventSendFromClientParams>) {
    if (!this.socket) {
      return;
    }
    this.socket.send(JSON.stringify({
      ...msg,
      roomName: msg.roomName || store.roomStore?.name,
    }));
  }
}

export const ws = new WS();
