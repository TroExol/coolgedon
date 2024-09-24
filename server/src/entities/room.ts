import type { EventParams } from 'socket.io/dist/typed-events';
import type { Namespace } from 'socket.io';
import type { Socket } from 'socket.io';

import { v4 as uuidv4 } from 'uuid';
import { getAvailableCards } from 'AvailableCards';
import {
  ECardTypes,
  EEventTypes,
  type TClientToServerEvents,
  type TPlayer,
  type TRoom,
  type TServerToClientEvents,
  type TServerToClientWithAckEvents,
  type TServerToClientWithoutAckEvents,
} from '@coolgedon/shared';

import type { ExtractedValue } from 'Type/helpers';
import type { TFillShopParams } from 'Type/entities/room';
import type { Skull } from 'Entity/skull';
import type { Prop } from 'Entity/prop';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

import { getProcessArg, shuffleArray } from 'Helpers';
import { Log } from 'Entity/log';

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
  private readonly nsp: Namespace<TClientToServerEvents, TServerToClientEvents>;
  private sockets: { [nickname: string]: Socket<TClientToServerEvents, TServerToClientEvents> } = {};
  activeLawlessness?: Card;
  activePlayerNickname: string;
  adminNickname: string;
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

  constructor(nsp: Namespace<TClientToServerEvents, TServerToClientEvents>, name: string, adminNickname: string) {
    const availableCards = getAvailableCards(this);

    this.nsp = nsp;
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
  }

  addPlayerSocket(nickname: string, socket: ExtractedValue<typeof this.sockets>) {
    this.sockets[nickname] = socket;
    this.sendInfo();
  }

  changeActivePlayer(player: Player | string) {
    const targetPlayer = this.getPlayer(player);

    const countTreasure3 = targetPlayer.getCountCards('activePermanent', ECardTypes.treasures, 3);
    if (countTreasure3) {
      targetPlayer.heal(countTreasure3 * targetPlayer.countActivePermanents);
    }

    this.activePlayerNickname = targetPlayer.nickname;
    targetPlayer.activatePermanents();
  }

  changeAdmin(player: Player | string) {
    if (typeof player === 'string') {
      this.adminNickname = player;
    } else {
      this.adminNickname = player.nickname;
    }
  }

  close() {
    this.nsp.disconnectSockets();
  }

  emitToPlayers<T extends keyof TServerToClientWithoutAckEvents>(
    players: Player[],
    event: T,
    ...params: EventParams<TServerToClientWithoutAckEvents, T>
  ) {
    players.forEach(player => this.getSocketClient(player.nickname)?.emit(event, ...params));
  }

  async emitWithAck<T extends keyof TServerToClientWithAckEvents>(
    nickname: string,
    event: T,
    params: EventParams<TServerToClientWithAckEvents, T>[0],
  ): Promise<Parameters<EventParams<TServerToClientWithAckEvents, T>[1]>[0]> {
    return new Promise((resolve, reject) => {
      if (!this.getSocketClient(nickname)) {
        reject(new Error(`Игрок ${nickname} не подключен к игре`));
        return;
      }
      const socketId = this.getSocketClient(nickname)?.id;

      const interval = setInterval(() => {
        const socket = this.getSocketClient(nickname);
        if (!socket || socket.id !== socketId) {
          clearInterval(interval);
          reject(new Error(`Игрок ${nickname} не подключен к игре`));
        }
      }, 500);
      const callback: (response: Parameters<EventParams<TServerToClientWithAckEvents, T>[1]>[0]) => void = response => {
        clearInterval(interval);
        resolve(response);
      };
      const args = [params, callback] as Parameters<TServerToClientEvents[T]>;
      this.getSocketClient(nickname)?.emit(event, ...args);
    });
  }

  endGame() {
    if (!this.playersArray.length) {
      return;
    }
    this.gameEnded = true;
    this.logEvent('Игра окончена');
    this.sendInfo();
    this.emitToPlayers(this.playersArray, EEventTypes.showModalEndGame, {
      players: [...this.playersArray.map(player => player.format(player))]
        .sort((p1, p2) => p2.victoryPoints! - p1.victoryPoints!),
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
        this.emitToPlayers(otherPlayers, EEventTypes.showModalCards, {
          cards: [card.format()],
        });
        let playPressed = false;
        let playerToPlayLawlessness = this.activePlayer;
        while (!playPressed) {
          try {
            await this.emitWithAck(playerToPlayLawlessness.nickname, EEventTypes.showModalPlayCard, {
              card: card.format(),
              canClose: false,
            });
            await card.play({ type: 'lawlessness', params: { player: playerToPlayLawlessness } });
            playPressed = true;
          } catch (error) {
            const otherPlayer = this.getPlayerByPos(playerToPlayLawlessness, 'left');
            if (!otherPlayer || otherPlayer === this.activePlayer) {
              console.error('Ошибка при отправке уведомления о беспределе: игроки закончились');
              break;
            }
            console.error('Ошибка при отправке уведомления о беспределе: ', error);
            playerToPlayLawlessness = otherPlayer;
          }
        }
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
    if (!this.deck.length) {
      this.endGame();
      return;
    }
    if (countAddedCards) {
      this.sendInfo();
    }
  }

  format(forPlayer: Player): TRoom {
    let formatted = {
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
    };

    if (getProcessArg('--debug') === 'true') {
      formatted = {
        ...formatted,
        onCurrentTurn: {
          activatedPermanents: this.onCurrentTurn.activatedPermanents.map(card => card.format()),
          powerWasted: this.onCurrentTurn.powerWasted,
          additionalPower: this.onCurrentTurn.additionalPower,
          playedCards: Object.values(this.onCurrentTurn.playedCards).flatMap(cards => cards.map(card => card.format())),
          usedCards: Object.values(this.onCurrentTurn.usedCards).flatMap(cards => cards.map(card => card.format())),
          boughtOrReceivedCards: Object.values(this.onCurrentTurn.boughtOrReceivedCards)
            .flatMap(cards => cards.map(card => card.format())),
        },
      } as TRoom & { onCurrentTurn: unknown; };
    }

    return formatted;
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

  getSocketClient(nickname: string): ExtractedValue<typeof this.sockets> | undefined {
    return this.sockets[nickname];
  }

  giveTowerToPlayer(player: Player) {
    this.getPlayersExceptPlayer(player).forEach(p => {
      p.hasTower = false;
    });
    player.hasTower = true;
  }

  logEvent(msg: string) {
    this.logs.push(new Log({
      id: uuidv4(),
      date: new Date().toISOString(),
      msg,
    }));
    this.emitToPlayers(this.playersArray, EEventTypes.sendLogs, this.logs.slice(-50).map(log => log.format()));
  }

  removeActiveLawlessness() {
    if (!this.activeLawlessness) {
      return;
    }

    this.removed.lawlessnesses.push(this.activeLawlessness);
    this.activeLawlessness = undefined;
  }

  removePlayerSocket(nickname: string) {
    delete this.sockets[nickname];
    this.sendInfo();
  }

  async removeShopCards(cards: Card[]) {
    await this.fillShop({ replaceCards: [...cards] });
    this.logEvent(`Удалено карт из магазина: ${cards.length} шт.`);
  }

  sendInfo() {
    this.playersArray.forEach(player => {
      this.emitToPlayers([player], EEventTypes.updateInfo, this.format(player));
    });
  }

  get activePlayer(): Player {
    return this.getPlayer(this.activePlayerNickname);
  }

  get admin(): Player {
    return this.getPlayer(this.adminNickname);
  }

  get countConnectedPlayers(): number {
    return Object.keys(this.sockets).length;
  }

  get playersArray(): Player[] {
    return Object.values(this.players);
  }
}

export const rooms: Record<string, Room> = {};
