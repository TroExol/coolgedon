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

  format(): TProp {
    return {
      id: this.id,
      canPlay: this.playable && !this.played,
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
