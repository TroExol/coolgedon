import * as path from 'path';
import * as fs from 'fs';
import { ECardTypeSprites, ECardTypes } from '@coolgedon/shared';

import type {
  TPlayCardByLawlessnessHandlerParams,
  TPlayCardByLawlessnessParams,
  TPlayGroupAttackParams,
  TPlayLawlessnessHandlerParams,
  TPlayLawlessnessParams, TPlayPermanentHandlerParams, TPlayPermanentParams,
  TSimplePlayCardHandlerParams,
  TSimplePlayCardParams,
} from 'Type/events/playCard';

import { legendGroupAttack } from 'CardHandler/legendGroupAttack';

export const simplePlayCard = async ({
  room,
  card,
  // На кого разыгрывают, например, если это перенаправление атаки
  target,
  // Кто атакует картой, например, при перенаправление атаки
  attacker,
  damage,
  canGuard = true,
  cardUsedByPlayer = false,
}: TSimplePlayCardParams) => {
  const logCardError = (error: unknown) => console.error(`Ошибка разыгрывания карты type: ${card.type} number: ${card.number}`, error);

  try {
    if (!room.activePlayer || room.gameEnded) {
      return;
    }
    if (card.theSameType(ECardTypes.lawlessnesses)) {
      throw new Error('Для разыгрывания беспредела нужно вызывать playLawlessness');
    }
    if (card.permanent) {
      throw new Error('Для разыгрывания постоянок нужно вызывать playPermanent');
    }

    // Нельзя разыгрывать ту же карту несколько раз
    if (cardUsedByPlayer && (card.played || card.playing)) {
      return;
    }

    if (!card.canPlay({ target })) {
      card.markAsPlayed();
      return;
    }

    const isSeparateType = card.type in ECardTypeSprites;
    const pathHandler = `../cardHandlers/${isSeparateType
      ? `${card.type}/${card.number}`
      : card.type}.ts`;

    if (!fs.existsSync(path.join(__dirname, pathHandler))) {
      throw new Error('Не найден обработчик карты');
    }

    const player = attacker || room.activePlayer;
    const markAsPlayed = () => {
      if (cardUsedByPlayer) {
        card.markAsPlayed();
      }
    };

    if (cardUsedByPlayer) {
      card.playing = true;
    }

    const handler = require(pathHandler).default as (data: TSimplePlayCardHandlerParams) => Promise<void>;
    try {
      await handler({
        room,
        card,
        // На кого разыгрывается карта
        target,
        // Кто разыгрывает карту и делает все действия
        player,
        // На кого засчитываются атаки и действия
        attacker: player,
        cardUsedByPlayer,
        canGuard,
        damage,
        byLawlessness: false,
        markAsPlayed,
      });
    } catch (error) {
      logCardError(error);
    } finally {
      if (cardUsedByPlayer) {
        card.playing = false;
      }
    }
  } catch (error) {
    logCardError(error);
  }
};

export const playCardByLawlessness = async ({
  room,
  card,
  target,
}: TPlayCardByLawlessnessParams) => {
  const logCardError = (error: unknown) => console.error(`Ошибка разыгрывания карты (от беспредела) type: ${card.type} number: ${card.number}`, error);

  try {
    if (!room.activePlayer || room.gameEnded) {
      return;
    }
    if (card.theSameType(ECardTypes.lawlessnesses)) {
      throw new Error('Для разыгрывания беспредела нужно вызывать playLawlessness');
    }
    if (card.permanent) {
      throw new Error('Для разыгрывания постоянок нужно вызывать playPermanent');
    }

    const isSeparateType = card.type in ECardTypeSprites;
    const pathHandler = `../cardHandlers/${isSeparateType
      ? `${card.type}/${card.number}`
      : card.type}.ts`;

    if (!fs.existsSync(path.join(__dirname, pathHandler))) {
      throw new Error('Не найден обработчик карты');
    }

    const handler = require(pathHandler).default as (data: TPlayCardByLawlessnessHandlerParams) => Promise<void>;
    await handler({
      room,
      card,
      // На кого разыгрывается карта
      target,
      // Кто разыгрывает карту и делает все действия
      player: room.activePlayer,
      cardUsedByPlayer: false,
      byLawlessness: true,
      canGuard: true,
    });
  } catch (error) {
    logCardError(error);
  }
};

export const playPermanent = async ({
  room,
  card,
  initPermanent = false,
}: TPlayPermanentParams) => {
  const logCardError = (error: unknown) => console.error(`Ошибка разыгрывания постоянки type: ${card.type} number: ${card.number}`, error);

  try {
    if (!room.activePlayer || room.gameEnded) {
      return;
    }
    if (!card.permanent) {
      throw new Error('playPermanent используется только для разыгрывания постоянок');
    }

    // Нельзя разыгрывать ту же карту несколько раз
    if (card.played || card.playing) {
      return;
    }

    const isSeparateType = card.type in ECardTypeSprites;
    const pathHandler = `../cardHandlers/${isSeparateType
      ? `${card.type}/${card.number}`
      : card.type}.ts`;

    if (!fs.existsSync(path.join(__dirname, pathHandler))) {
      throw new Error('Не найден обработчик карты');
    }

    card.playing = true;

    const handler = require(pathHandler).default as (data: TPlayPermanentHandlerParams) => Promise<void>;
    try {
      await handler({
        room,
        card,
        initPermanent,
      });
    } catch (error) {
      logCardError(error);
    } finally {
      card.playing = false;
    }
  } catch (error) {
    logCardError(error);
  }
};

export const playLawlessness = async ({
  room,
  card,
}: TPlayLawlessnessParams) => {
  const logCardError = (error: unknown) => console.error(`Ошибка разыгрывания беспредела type: ${card.type} number: ${card.number}`, error);

  try {
    if (!room.activePlayer || room.gameEnded) {
      return;
    }
    if (!card.theSameType(ECardTypes.lawlessnesses)) {
      throw new Error('playLawlessness используется только для разыгрывания беспределов');
    }

    if (!card.canPlay()) {
      room.removeActiveLawlessness();
      return;
    }

    const pathHandler = `../cardHandlers/lawlessnesses/${card.number}.ts`;
    if (!fs.existsSync(path.join(__dirname, pathHandler))) {
      throw new Error('Не найден обработчик карты');
    }

    const handler = require(pathHandler).default as (data: TPlayLawlessnessHandlerParams) => Promise<void>;
    await handler({ room, card });

    room.removeActiveLawlessness();
  } catch (error) {
    logCardError(error);
  }
};

export const playGroupAttack = async ({
  room,
  card,
  // На кого разыгрывают, например, если это перенаправление атаки
  target,
  byLawlessness = false,
}: TPlayGroupAttackParams) => {
  const logCardError = (error: unknown) => console.error(`Ошибка разыгрывания групповой атаки type: ${card.type} number: ${card.number}`, error);

  try {
    if (!room.activePlayer || room.gameEnded) {
      return;
    }
    if (!card.theSameType(ECardTypes.legends)) {
      throw new Error('playGroupAttack используется только для разыгрывания групповых атак легенды');
    }

    await legendGroupAttack({
      room,
      // На кого разыгрывается карта
      target,
      card,
      byLawlessness,
    });
  } catch (error) {
    logCardError(error);
  }
};
