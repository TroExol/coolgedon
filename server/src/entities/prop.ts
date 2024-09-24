import type { TProp } from '@coolgedon/shared';

import type { Room } from 'Entity/room';

import { playProp } from 'Event/playProp';

interface TPropConstructorParams {
  id: number;
  playable: boolean;
  room: Room;
}

export class Prop {
  private readonly room: Room;
  readonly id: number;
  ownerNickname?: string;
  readonly playable: boolean;
  played = false;
  playing = false;
  temp = false;

  constructor({
    id,
    playable,
    room,
  }: TPropConstructorParams) {
    this.id = id;
    this.playable = playable;
    this.room = room;
  }

  canPlay(): boolean {
    switch (this.id) {
      case 1:
        return !!this.owner?.discard.length;
      case 2:
        return true;
      case 3:
        return !!this.room.onCurrentTurn.boughtOrReceivedCards.wizards?.length;
      case 4:
        return (this.owner?.hp ?? 0) >= 4;
      case 5:
      case 6:
      case 7:
      case 8:
        return true;
      default:
        return false;
    }
  }

  format(): TProp {
    return {
      id: this.id,
      canPlay: this.playable && !this.played && this.canPlay(),
    };
  }

  markAsPlayed() {
    const owner = this.owner;
    if (!owner) {
      console.error('Невозможно пометить свойство разыгранным: нет владельца');
      return;
    }
    if (!owner.theSame(this.room.activePlayer)) {
      console.error('Невозможно пометить свойство разыгранным: владелец не активный игрок');
      return;
    }
    this.played = true;
    this.room.logEvent(`Игрок ${owner.nickname} разыграл свойство`);
    this.room.sendInfo();
  }

  async play(params: Omit<Parameters<typeof playProp>[0], 'room' | 'prop'> = {}) {
    if (!this.owner) {
      console.error('Невозможно разыграть свойство: нет владельца');
      return;
    }
    if (!this.owner.theSame(this.room.activePlayer)) {
      console.error('Невозможно разыграть свойство: владелец не активный игрок');
      return;
    }
    return playProp({
      ...params,
      room: this.room,
      prop: this,
    });
  }

  get owner() {
    if (!this.ownerNickname) {
      return;
    }
    return this.room.getPlayer(this.ownerNickname);
  }
}
