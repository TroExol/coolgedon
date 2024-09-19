import { Server } from 'socket.io';
import { EEventTypes, type TClientToServerEvents, type TServerToClientEvents } from '@coolgedon/shared';

import { getCardInFromClient, getProcessArg, getPropInFromClient } from 'Helpers';
import { removeRoom } from 'Event/removeRoom';
import { removePlayer } from 'Event/removePlayer';
import { playProp } from 'Event/playProp';
import { simplePlayCard } from 'Event/playCard';
import { playAllCards } from 'Event/playAllCards';
import { joinPlayer } from 'Event/joinPlayer';
import { endTurn } from 'Event/endTurn';
import { countRooms } from 'Event/countRooms';
import { buyShopCard } from 'Event/buyShopCard';
import { buyLegendCard } from 'Event/buyLegendCard';
import { buyFamiliarCard } from 'Event/buyFamiliarCard';
import { buyCrazyMagicCard } from 'Event/buyCrazyMagicCard';
import { Room, rooms } from 'Entity/room';

const localhost = getProcessArg('--local') === 'true';

const io = new Server<TClientToServerEvents, TServerToClientEvents>({
  cors: {
    origin: localhost ? '*' : 'https://toexol.ru',
    methods: ['GET', 'POST'],
  },
  cleanupEmptyChildNamespaces: true,
  connectionStateRecovery: {
    maxDisconnectionDuration: 0.5 * 60 * 1000,
    skipMiddlewares: false,
  },
});

// Неймспейс для всех комнат
const roomsNamespace = io.of(/^\/room-.+$/);

roomsNamespace.use((socket, next) => {
  // Неймспейс для конкретной комнаты
  const roomNamespace = socket.nsp;
  const roomName = roomNamespace.name.match(/(?<=room-).+/)?.[0];

  if (!roomName) {
    next(new Error('Не указано имя комнаты'));
    return;
  }

  const nickname = socket.handshake.query.nickname;

  if (typeof nickname !== 'string' || !nickname) {
    next(new Error('Не указан никнейм'));
    return;
  }

  const roomExists = !!rooms[roomName];

  if (!roomExists) {
    rooms[roomName] = new Room(roomNamespace, roomName, nickname);
  }

  if (!roomExists) {
    next();
    return;
  }

  const room = rooms[roomName];

  if (room.gameEnded) {
    next(new Error('Игра окончена'));
    return;
  }

  if (room.getSocketClient(nickname)) {
    next(new Error('Пользователь с таким никнеймом уже в игре'));
    return;
  }

  if (room.countConnectedPlayers >= 5) {
    next(new Error('Игроков уже 5'));
    return;
  }

  next();
});

// socket уникален для каждого клиента
roomsNamespace.on('connection', async socket => {
  const roomName = socket.nsp.name.match(/(?<=room-).+/)?.[0] as string;
  const nickname = socket.handshake.query.nickname as string;
  const room = rooms[roomName];
  room.addPlayerSocket(nickname, socket);

  socket.use((_, next) => {
    if (!rooms[roomName]) {
      next(new Error('Комната не найдена'));
      return;
    }

    if (room.gameEnded) {
      next(new Error('Игра окончена'));
      return;
    }

    next();
  });

  socket.on('error', console.error);

  socket.on('disconnect', () => {
    const socketClient = room.getSocketClient(nickname);
    if (!socketClient) {
      return;
    }
    room.logEvent(`Игрок ${nickname} отключился`);
    room.removePlayerSocket(nickname);
    if (!room.countConnectedPlayers) {
      removeRoom(room);
    }
  });

  try {
    await joinPlayer({ room, nickname });
  } catch (error) {
    console.error('Ошибка создания игрока', error);
    socket.disconnect();
    return;
  }

  socket.on(EEventTypes.removePlayer, param => {
    try {
      removePlayer({ room, nickname: param });
    } catch (error) {
      console.error('Ошибка удаления игрока', error);
    }
  });
  socket.on(EEventTypes.buyLegendCard, () => {
    try {
      buyLegendCard(room);
    } catch (error) {
      console.error('Ошибка покупки легенды', error);
    }
  });
  socket.on(EEventTypes.buyCrazyMagicCard, () => {
    try {
      buyCrazyMagicCard(room);
    } catch (error) {
      console.error('Ошибка покупки шальной магии', error);
    }
  });
  socket.on(EEventTypes.buyFamiliarCard, () => {
    try {
      buyFamiliarCard(room);
    } catch (error) {
      console.error('Ошибка покупки фамильяра', error);
    }
  });
  socket.on(EEventTypes.endTurn, async () => {
    try {
      await endTurn(room);
    } catch (error) {
      console.error('Ошибка окончания хода', error);
    }
  });
  socket.on(EEventTypes.removeRoom, () => {
    try {
      removeRoom(room);
    } catch (error) {
      console.error('Ошибка удаления комнаты', error);
    }
  });
  socket.on(EEventTypes.playAllCards, async () => {
    try {
      await playAllCards(room);
    } catch (error) {
      console.error('Ошибка разыгрывания всех карт', error);
    }
  });

  socket.on(EEventTypes.buyShopCard, async param => {
    try {
      const card = getCardInFromClient(param, room.shop);
      if (!card) {
        return;
      }
      await buyShopCard({ room, card });
    } catch (error) {
      console.error('Ошибка покупки карты из барахолки', error);
    }
  });

  socket.on(EEventTypes.playCard, async param => {
    try {
      const card = getCardInFromClient(param, room.activePlayer.hand);
      if (!card) {
        return;
      }
      await simplePlayCard({ room, card, cardUsedByPlayer: true });
    } catch (error) {
      console.error('Ошибка разыгрывания карты', error);
    }
  });

  socket.on(EEventTypes.playProp, async param => {
    try {
      const prop = getPropInFromClient(param, room.activePlayer.props);
      if (!prop) {
        return;
      }
      await playProp({ room, prop });
    } catch (error) {
      console.error('Ошибка разыгрывания свойства', error);
    }
  });

  socket.on(EEventTypes.countRooms, async callback => {
    try {
      countRooms(callback);
    } catch (error) {
      console.error('Ошибка отправки кол-ва комнат', error);
    }
  });
});

io.on('connection', socket => {
  console.log('io: New client connected');
  socket.on('error', console.error);
});

io.listen(4001);
