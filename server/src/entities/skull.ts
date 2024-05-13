import type { TSkull } from '@coolgedon/shared';

import type { Room } from 'Entity/room';

import { playSkull } from 'Event/playSkull';

interface TSkullConstructorParams {
  room: Room;
  id: number;
}

export class Skull {
  private readonly room: Room;
  readonly id: number;
  ownerNickname?: string;

  constructor({
    id,
    room,
  }: TSkullConstructorParams) {
    this.id = id;
    this.room = room;
  }

  format(): TSkull {
    return {
      id: this.id,
    };
  }

  async play(params: Omit<Parameters<typeof playSkull>[0], 'room' | 'skull'> = {}) {
    if (!this.owner) {
      console.error('Невозможно разыграть жетон: нет владельца');
      return;
    }
    return playSkull({
      ...params,
      room: this.room,
      skull: this,
    })
      .then(() => {
        if (!this.room.skulls.length) {
          this.room.endGame();
        }
      });
  }

  theSame(skull: Skull) {
    return this.id === skull.id;
  }

  get owner() {
    if (!this.ownerNickname) {
      return;
    }
    return this.room.getPlayer(this.ownerNickname);
  }
}
