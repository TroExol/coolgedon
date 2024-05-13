import type { WebSocket, WebSocketServer } from 'ws';
import type { TPlayer } from '@coolgedon/shared';
import type { TEventSendFromServerParams } from '@coolgedon/shared';
import type { TRoom } from '@coolgedon/shared';

import { v4 as uuidv4 } from 'uuid';
import { getAvailableCards } from 'AvailableCards';
import { ECardTypes, EEventTypes, EModalTypes } from '@coolgedon/shared';

import type { TFillShopParams, TWsRequestQueueValue } from 'Type/entities/room';
import type { Skull } from 'Entity/skull';
import type { Prop } from 'Entity/prop';
import type { Card } from 'Entity/card';

import { shuffleArray } from 'Helpers';
import { Player } from 'Entity/player';
import { Log } from 'Entity/log';

export const wsRequestDataQueue: {[requestId: string]: TWsRequestQueueValue} = {};

export const wsClients: {[roomName: string]: {[playerNickname: string]: WebSocket}} = {};

interface TOnCurrentTurn {
  activatedPermanents: Card[];
  powerWasted: number;
  // Добавлено мощи картами
  additionalPower: number;
  playedCards: Partial<Record<ECardTypes, Card[]>>;
  boughtOrReceivedCards: Partial<Record<ECardTypes, Card[]>>;
  usedCards: Partial<Record<ECardTypes, Card[]>>;
}

export const getEmptyOnCurrentTurn = (): TOnCurrentTurn => JSON.parse(JSON.stringify({
  activatedPermanents: [],
  powerWasted: 0,
  additionalPower: 0,
  playedCards: {},
  usedCards: {},
  boughtOrReceivedCards: {},
} as TOnCurrentTurn));

export class Room {
  private activePlayerNickname: string;
  private adminNickname: string;
  activeLawlessness?: Card;
  crazyMagic: Card[];
  deck: Card[];
  familiars: Card[];
  gameEnded = false;
  legends: Card[];
  logs: Log[] = [];
  name: string;
  onCurrentTurn: TOnCurrentTurn;
  players: Record<string, Player> = {};
  props: Prop[];
  removed: {
    cards: Card[];
    lawlessnesses: Card[];
  } = {
      cards: [],
      lawlessnesses: [],
    };
  shop: Card[] = [];
  skulls: Skull[];
  sluggishStick: Card[];
  wasLawlessnessesOnCurrentTurn = false;

  readonly wss: WebSocketServer;

  constructor(wss: WebSocketServer, name: string, adminNickname: string) {
    const availableCards = getAvailableCards(this);

    this.name = name;
    this.activePlayerNickname = adminNickname;
    this.adminNickname = adminNickname;
    this.crazyMagic = availableCards.crazyMagic;
    this.sluggishStick = availableCards.sluggishStick;
    this.familiars = availableCards.familiars;
    this.skulls = shuffleArray(availableCards.skulls);
    this.props = shuffleArray(availableCards.props);
    this.onCurrentTurn = getEmptyOnCurrentTurn();
    this.legends = [
      ...shuffleArray(availableCards.legends.slice(1)),
      availableCards.legends[0],
    ];
    this.deck = shuffleArray([
      ...availableCards.lawlessnesses,
      ...availableCards.creatures,
      ...availableCards.places,
      ...availableCards.spells,
      ...availableCards.treasures,
      ...availableCards.wizards,
    ]);
    void this.fillShop({ canLawlessnesses: false });
    this.wss = wss;
  }

  changeActivePlayer(player: Player | string) {
    const targetPlayer = this.getPlayer(player);

    const countTreasure3 = targetPlayer.getCountCards('activePermanent', ECardTypes.treasures, 3);
    if (countTreasure3) {
      targetPlayer.heal(countTreasure3 * targetPlayer.countActivePermanents);
    }

    this.activePlayerNickname = targetPlayer?.nickname;
    targetPlayer.activatePermanents();
  }

  changeAdmin(player: Player | string) {
    if (typeof player === 'string') {
      this.adminNickname = player;
    } else {
      this.adminNickname = player.nickname;
    }
  }

  endGame() {
    if (!this.playersArray.length) {
      return;
    }
    this.gameEnded = true;
    this.logEvent('Игра окончена');
    this.sendInfo();
    this.wsSendMessage({
      event: EEventTypes.showModal,
      data: {
        modalType: EModalTypes.endGame,
        players: [...this.playersArray.map(player => player.format(player))]
          .sort((p1, p2) => p2.victoryPoints! - p1.victoryPoints!),
      },
    });
  }

  async fillShop({
    canLawlessnesses = true,
    replaceCards,
  }: TFillShopParams = {}) {
    let countAddedCards = 0;
    while (this.shop.length < 5 || replaceCards?.length) {
      if (!this.deck.length) {
        this.endGame();
        return;
      }
      const card = this.deck.splice(-1)[0];

      if (
        (!canLawlessnesses || this.wasLawlessnessesOnCurrentTurn)
          && card.theSameType(ECardTypes.lawlessnesses)
      // || shop.some(shopCard => theSameTypeCards(card, shopCard.type, shopCard.cardNumber))
      ) {
        this.removed.lawlessnesses.push(card);
        continue;
      }

      if (card.theSameType(ECardTypes.lawlessnesses) && this.activePlayer) {
        this.wasLawlessnessesOnCurrentTurn = true;
        if (!card.canPlay()) {
          this.removed.lawlessnesses.push(card);
          continue;
        }
        this.logEvent('БЕСПРЕДЕЕЕЛ!!!');
        this.sendInfo();
        this.activeLawlessness = card;
        const otherPlayers = this.getPlayersExceptPlayer(this.activePlayer);
        this.wsSendMessage({
          event: EEventTypes.showModal,
          data: {
            modalType: EModalTypes.cards,
            cards: [card.format()],
            select: false,
          },
        }, otherPlayers);
        await this.wsSendMessageAsync(this.activePlayer.nickname, {
          event: EEventTypes.showModal,
          data: {
            modalType: EModalTypes.playCard,
            card: card.format(),
            canClose: false,
          },
        });
        await card.play({ type: 'lawlessness' });
        continue;
      }

      if (replaceCards?.length) {
        const replaceCard = replaceCards.splice(-1)[0];
        const replaceCardIndex = this.shop.findIndex(c => c.theSame(replaceCard));
        this.shop.splice(replaceCardIndex, 1, card);
      } else {
        this.shop.push(card);
      }
      countAddedCards++;
    }
    if (countAddedCards) {
      this.sendInfo();
    }
  }

  format(forPlayer: Player): TRoom {
    return {
      activeLawlessness: this.activeLawlessness?.format(),
      activePlayerNickname: this.activePlayerNickname,
      adminNickname: this.adminNickname,
      deck: this.deck.map(card => card.format()),
      playerNickname: forPlayer.nickname,
      gameEnded: this.gameEnded,
      legends: this.legends.map(legend => legend.format(this.activePlayer)),
      name: this.name,
      players: this.playersArray.reduce<Record<string, TPlayer>>((acc, player) => {
        acc[player.nickname] = player.format(forPlayer);
        return acc;
      }, {}),
      props: this.props.map(card => card.format()),
      removed: {
        cards: this.removed.cards.map(card => card.format()),
        lawlessnesses: this.removed.lawlessnesses.map(card => card.format()),
      },
      shop: this.shop.map(card => card.format(this.activePlayer)),
      skulls: this.skulls.map(card => card.format()),
      crazyMagic: this.crazyMagic.map(card => card.format(this.activePlayer)),
      sluggishStick: this.sluggishStick.map(card => card.format()),

      // debug
      // onCurrentTurn: {
      //   activatedPermanents: this.onCurrentTurn.activatedPermanents.map(card => card.format()),
      //   powerWasted: this.onCurrentTurn.powerWasted,
      //   additionalPower: this.onCurrentTurn.additionalPower,
      //   playedCards: Object.values(this.onCurrentTurn.playedCards).flatMap(cards => cards.map(card => card.format())),
      //   usedCards: Object.values(this.onCurrentTurn.usedCards).flatMap(cards => cards.map(card => card.format())),
      //   boughtOrReceivedCards: Object.values(this.onCurrentTurn.boughtOrReceivedCards)
      //     .flatMap(cards => cards.map(card => card.format())),
      // },
    };
  }

  getPlayedCards(type: ECardTypes, number?: number): Card[] {
    return this.onCurrentTurn.playedCards[type]?.filter(card => card.theSameType(type, number)) || [];
  }

  getPlayer(player: Player | string): Player {
    return this.players[typeof player === 'string'
      ? player
      : player.nickname];
  }

  getPlayerByPos(fromPlayer: Player | string, pos: 'left' | 'right'): Player | undefined {
    let player: Player;
    if (typeof fromPlayer === 'string') {
      player = this.getPlayer(fromPlayer);
    } else {
      player = fromPlayer;
    }
    const allPlayers = this.playersArray;
    if (allPlayers.length <= 1) {
      return;
    }

    let playerIndex = 0;

    for (let i = 0; i < allPlayers.length; i += 1) {
      if (allPlayers[i].nickname === player.nickname) {
        playerIndex = i;
        break;
      }
    }

    let resPos: number;

    if (playerIndex === 0) {
      resPos = pos === 'right'
        ? allPlayers.length - 1
        : 1;
    } else if (playerIndex === allPlayers.length - 1) {
      resPos = pos === 'right'
        ? playerIndex - 1
        : 0;
    } else {
      resPos = pos === 'right'
        ? playerIndex - 1
        : playerIndex + 1;
    }

    return allPlayers[resPos];
  }

  getPlayersExceptPlayer(player: Player | string) {
    if (typeof player === 'string') {
      return this.playersArray.filter(p => p.nickname !== player);
    }
    return this.playersArray.filter(p => p.nickname !== player.nickname);
  }

  getWsClient(nickname: string): WebSocket | undefined {
    return wsClients[this.name]?.[nickname];
  }

  logEvent(msg: string) {
    this.logs.push(new Log({
      id: uuidv4(),
      date: new Date().toISOString(),
      msg,
    }));
    this.wsSendMessage({
      event: EEventTypes.sendLogs,
      data: this.logs.slice(-50).map(log => log.format()),
    });
  }

  removeActiveLawlessness() {
    if (!this.activeLawlessness) {
      return;
    }

    this.removed.lawlessnesses.push(this.activeLawlessness);
    this.activeLawlessness = undefined;
  }

  async removeShopCards(cards: Card[]) {
    await this.fillShop({ replaceCards: [...cards] });
    this.logEvent(`Удалено карт из магазина: ${cards.length} шт.`);
  }

  sendInfo() {
    this.playersArray.forEach(player => {
      this.wsSendMessage({
        event: EEventTypes.updateInfo,
        data: this.format(player),
      }, [player]);
    });
  }

  wsSendMessage(msg: TEventSendFromServerParams, targets?: Player[] | WebSocket[]) {
    if (!targets) {
      this.playersArray.forEach(player => this.getWsClient(player.nickname)?.send(JSON.stringify(msg)));
      return;
    }
    if (targets[0] instanceof Player) {
      (targets as Player[]).forEach(target => this.getWsClient(target.nickname)?.send(JSON.stringify(msg)));
    } else {
      (targets as WebSocket[]).forEach(ws => ws.send(JSON.stringify(msg)));
    }
  }

  async wsSendMessageAsync<T>(
    receiverNickname: string,
    msg: TEventSendFromServerParams,
    options?: { timeoutMs?: number; },
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let timeout: NodeJS.Timeout;
      const requestId = uuidv4();

      const rejectWrapper = (reason?: Error) => {
        if (timeout) {
          clearTimeout(timeout);
        }
        delete wsRequestDataQueue[requestId];
        reject(reason);
      };
      const resolveWrapper = (data: T) => {
        if (timeout) {
          clearTimeout(timeout);
        }
        delete wsRequestDataQueue[requestId];
        resolve(data);
      };

      try {
        const wsClient = this.getWsClient(receiverNickname);
        if (!wsClient) {
          rejectWrapper(new Error(`${new Date().toLocaleString()} ${receiverNickname} не подключен к серверу`));
          return;
        }

        if (options?.timeoutMs) {
          timeout = setTimeout(() => {
            rejectWrapper(new Error(`${new Date().toLocaleString()} ${receiverNickname} не отвечает`));
          }, options.timeoutMs);
        }
        wsRequestDataQueue[requestId] = {
          roomName: this.name,
          receiverNickname,
          resolve: resolveWrapper as (data: unknown) => void,
          reject: rejectWrapper,
        };
        this.wsSendMessage({
          ...msg,
          requestId,
        }, [wsClient]);
      } catch (error) {
        console.error(`${new Date().toLocaleString()} ${receiverNickname} Необработанная ошибка асинхронного запроса WebSocket`, error);
        rejectWrapper(error as Error);
      }
    });
  }

  get activePlayer(): Player {
    return this.getPlayer(this.activePlayerNickname);
  }

  get admin(): Player {
    return this.getPlayer(this.adminNickname);
  }

  get playersArray(): Player[] {
    return Object.values(this.players);
  }
}

export const rooms: Record<string, Room> = {};
