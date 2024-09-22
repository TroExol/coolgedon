import * as path from 'path';
import * as fs from 'fs';
import { ECardTypeSprites } from '@coolgedon/shared';

import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

export interface TPlayGuardParams {
  room: Room;
  target: Player;
  card: Card;
  cardAttack: Card;
  attacker?: Player;
  damage?: number;
}
export interface TPlayGuardHandlerParams {
  room: Room;
  target: Player;
  card: Card;
  cardAttack: Card;
  attacker?: Player;
  damage?: number;
}

// TODO: перенести в Card
export async function playGuard({
  room,
  attacker,
  target,
  card,
  cardAttack,
  damage,
}: TPlayGuardParams): Promise<void> {
  try {
    if (!room.activePlayer || room.gameEnded || card.played || card.playing) {
      return;
    }

    const isSeparateType = card.type in ECardTypeSprites;
    const pathHandler = `../guardHandlers/${isSeparateType
      ? `${card.type}/${card.number}`
      : card.type}.ts`;

    if (!fs.existsSync(path.join(__dirname, pathHandler))) {
      throw new Error('Не найден обработчик карты');
    }

    card.playing = true;

    const handler: (data: TPlayGuardHandlerParams) => Promise<void> = require(pathHandler).default;
    await handler({
      room,
      card,
      cardAttack,
      target: room.getPlayer(target),
      attacker: attacker
        ? room.getPlayer(attacker)
        : undefined,
      damage,
    });

    if (card.permanent) {
      target.discardCards([card], 'activePermanent');
    } else {
      target.discardCards([card], 'hand');
    }
  } catch (error) {
    console.error(`Ошибка разыгрывания карты защиты type ${card.type} number ${card.number}`, error);
  } finally {
    card.playing = false;
  }
}
