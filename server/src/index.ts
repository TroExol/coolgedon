import type { WebSocket } from 'ws';
import type { TEventSendFromClientParams } from '@coolgedon/shared';

import { WebSocketServer } from 'ws';
import { EEventTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';

import {
  getCardInFromClient,
  getCardsInFromClient,
  getPropInFromClient,
  getPropsInFromClient,
} from 'Helpers';
import { reset } from 'Event/reset';
import { removePlayer } from 'Event/removePlayer';
import { playProp } from 'Event/playProp';
import { simplePlayCard } from 'Event/playCard';
import { playAllCards } from 'Event/playAllCards';
import { joinPlayer } from 'Event/joinPlayer';
import { endTurn } from 'Event/endTurn';
import { disconnect } from 'Event/disconnect';
import { cancelSelectStartCards } from 'Event/cancelSelectStartCards';
import { buyShopCard } from 'Event/buyShopCard';
import { buyLegendCard } from 'Event/buyLegendCard';
import { buyFamiliarCard } from 'Event/buyFamiliarCard';
import { buyCrazyMagicCard } from 'Event/buyCrazyMagicCard';
import { rooms, wsClients, wsRequestDataQueue } from 'Entity/room';

const wss = new WebSocketServer({
  port: 4001,
});

export const eventHandler = async (params: TEventSendFromClientParams, ws?: WebSocket) => {
  try {
    const {
      data,
      event,
      requestId,
      roomName,
    } = params;

    const room: Room | undefined = rooms[roomName];

    if (requestId && wsRequestDataQueue[requestId]) {
      wsRequestDataQueue[requestId].resolve(data);
    }

    if (!event) {
      return;
    }

    switch (event) {
      case EEventTypes.joinPlayer:
        if (!ws) {
          break;
        }
        await joinPlayer({
          room, roomName, wss, ws, ...data,
        });
        break;
      case EEventTypes.cancelSelectStartCards: {
        const familiars = getCardsInFromClient(data.familiars, room.familiars);
        const props = getPropsInFromClient(data.props, room.props);
        cancelSelectStartCards({ room, familiars, props });
        break;
      }
      case EEventTypes.removePlayer:
        removePlayer({ room, ...data });
        break;
      case EEventTypes.buyShopCard: {
        const card = getCardInFromClient(data.card, room.shop);
        if (!card) {
          break;
        }
        await buyShopCard({ room, card });
        break;
      }
      case EEventTypes.buyLegendCard:
        buyLegendCard(room);
        break;
      case EEventTypes.buyCrazyMagicCard:
        buyCrazyMagicCard(room);
        break;
      case EEventTypes.buyFamiliarCard:
        buyFamiliarCard(room);
        break;
      case EEventTypes.playCard: {
        const card = getCardInFromClient(data.card, room.activePlayer.hand);
        if (!card) {
          break;
        }
        await simplePlayCard({ room, card, cardUsedByPlayer: true });
        break;
      }
      case EEventTypes.playProp: {
        const prop = getPropInFromClient(data.prop, room.activePlayer.props);
        if (!prop) {
          break;
        }
        await playProp({ room, prop });
        break;
      }
      case EEventTypes.endTurn:
        await endTurn(room);
        break;
      case EEventTypes.disconnect:
        if (!ws) {
          break;
        }
        disconnect({ room, ws, ...data });
        break;
      case EEventTypes.reset:
        reset(room);
        break;
      case EEventTypes.playAllCards:
        await playAllCards(room);
        break;
      case EEventTypes.ping:
        break;
      default:
        console.error('Неизвестный тип события', event);
    }
  } catch (error) {
    console.error('Ошибка выполнения действия', error);
  }
};

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', async data => {
    try {
      const parsed = JSON.parse(data.toString());
      await eventHandler(parsed, ws);
    } catch (error) {
      console.error(error);
    }
  });
});

setInterval(() => {
  try {
    // Удаление офлайн игроков
    Object.values(rooms).forEach(room => {
      room.playersArray.forEach(async player => {
        if (!room.getWsClient(player.nickname)) {
          return;
        }
        room.wsSendMessageAsync(
          player.nickname,
          { event: EEventTypes.ping },
          { timeoutMs: 3000 },
        ).catch(error => {
          delete wsClients[room.name][player.nickname];
          console.error('Ошибка пинга', error);
        });
      });
    });
  } catch (error) {
    console.error(error);
  }
}, 3000);

setInterval(() => {
  try {
    // Удаление запросов, к которым игрок больше не доступен
    const requests = Object.values(wsRequestDataQueue);
    for (let i = requests.length - 1; i >= 0; i--) {
      const {
        roomName,
        receiverNickname,
        reject,
      } = requests[i];
      const room = rooms[roomName];

      if (!room?.getWsClient(receiverNickname)) {
        reject(new Error('Пользователь не находится в игре'));
      }
    }

    // Удаление пустых комнат, если с момента последнего запроса прошло больше 5 минут
    Object.values(rooms).forEach(room => {
      const lastLogTime = new Date(room.logs.slice(-1)[0]?.date).getTime();
      const curTime = new Date().getTime();
      if (!Object.values(wsClients[room.name]).length
          // Прошло больше 5 минут
          && (Number.isNaN(lastLogTime) || (curTime - lastLogTime) - 5 * 60 * 1000 < 0)) {
        delete rooms[room.name];
        delete wsClients[room.name];
        delete wsRequestDataQueue[room.name];
      }
    });
  } catch (error) {
    console.error(error);
  }
}, 5 * 60 * 1000);
