import type { TPlayer, TRoom } from '@coolgedon/shared';

import { makeAutoObservable } from 'mobx';
import equal from 'fast-deep-equal';

export class RoomStore {
  activePlayerNickname: TRoom['activePlayerNickname'] = '';
  adminNickname: TRoom['adminNickname'] = '';
  crazyMagic: TRoom['crazyMagic'] = [];
  deck: TRoom['deck'] = [];
  gameEnded: TRoom['gameEnded'] = false;
  legends: TRoom['legends'] = [];
  myNickname = '';
  name: TRoom['name'] = '';
  players: TRoom['players'] = {};
  props: TRoom['props'] = [];
  removed: TRoom['removed'] = {
    cards: [],
    lawlessnesses: [],
  };
  shop: TRoom['shop'] = [];
  skulls: TRoom['skulls'] = [];
  sluggishStick: TRoom['sluggishStick'] = [];

  constructor(data: TRoom) {
    makeAutoObservable(this, {}, { autoBind: true });
    this.update(data);
  }

  getPlayer(player: TPlayer | string): TPlayer {
    return typeof player === 'string'
      ? this.players[player]
      : this.players[player.nickname];
  }

  isActive(player: TPlayer | string) {
    return typeof player === 'string'
      ? player === this.activePlayerNickname
      : player.nickname === this.activePlayerNickname;
  }

  isAdmin(player: TPlayer | string) {
    return typeof player === 'string'
      ? player === this.adminNickname
      : player.nickname === this.adminNickname;
  }

  isMe(player: TPlayer | string) {
    return typeof player === 'string'
      ? player === this.myNickname
      : player.nickname === this.myNickname;
  }

  update(data: TRoom) {
    this.activePlayerNickname = data.activePlayerNickname;
    this.adminNickname = data.adminNickname;
    this.gameEnded = data.gameEnded;
    this.name = data.name;
    this.myNickname = data.playerNickname;

    if (!equal(this.deck, data.deck)) {
      this.deck = data.deck;
    }
    if (!equal(this.shop, data.shop)) {
      this.shop = data.shop;
    }
    if (!equal(this.legends, data.legends)) {
      this.legends = data.legends;
    }
    if (!equal(this.players, data.players)) {
      this.players = data.players;
    }
    if (!equal(this.props, data.props)) {
      this.props = data.props;
    }
    if (!equal(this.skulls, data.skulls)) {
      this.skulls = data.skulls;
    }
    if (!equal(this.crazyMagic, data.crazyMagic)) {
      this.crazyMagic = data.crazyMagic;
    }
    if (!equal(this.sluggishStick, data.sluggishStick)) {
      this.sluggishStick = data.sluggishStick;
    }
    // if (!equal(this.logs, data.logs)) {
    //   this.logs = data.logs;
    // }
    if (!equal(this.removed, data.removed)) {
      this.removed = data.removed;
    }
  }

  get activePlayer() {
    return this.getPlayer(this.activePlayerNickname);
  }

  get me() {
    return this.getPlayer(this.myNickname);
  }

  get playersArray() {
    return Object.values(this.players);
  }
}
