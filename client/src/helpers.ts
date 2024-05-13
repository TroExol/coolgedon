import type { KeyboardEvent, KeyboardEventHandler } from 'react';
import type { ECardTypes, TCard } from '@coolgedon/shared';

export function theSameCards(card1: TCard, card2: TCard) {
  return card1.id === card2.id;
}

export function theSameTypeCards(card: TCard, type: ECardTypes, number?: number) {
  return card.type === type && (!number || card.number === number);
}

export function onEnter(callback: (event: KeyboardEvent) => void) {
  const returnFunction: KeyboardEventHandler = event => {
    if (event.key === 'Enter') {
      callback(event);
    }
  };
  return returnFunction;
}

export function getLastElement<T>(arr: T[]): T | undefined {
  return arr.slice(-1)[0];
}
