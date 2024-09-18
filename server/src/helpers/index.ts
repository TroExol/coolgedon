import type {
  TCard, TProp, TSkull, TVariant,
} from '@coolgedon/shared';

import { ECardTypes } from '@coolgedon/shared';

import type { Skull } from 'Entity/skull';
import type { Prop } from 'Entity/prop';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

export function getProcessArg(name: string): string | undefined {
  const processArgs = process.argv.slice(2);
  const index = processArgs.indexOf(name);

  if (index === -1) {
    return;
  }

  return processArgs[index + 1];
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  let currentIndex = newArray.length;
  let randomIndex;

  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex],
    ];
  }

  return newArray;
}

export function getRandomElements<T>(array: T[], count: number): T[] {
  const arrayCopy = [...array];
  const result: T[] = [];

  for (let i = 0; i < count; i++) {
    const index = Math.floor(Math.random() * arrayCopy.length);
    result.push(arrayCopy[index]);
    arrayCopy.splice(index, 1);
  }

  return result;
}

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getCountCardsIn(from: Card[], type: ECardTypes, number?: number): number {
  return from.filter(card => card.theSameType(type, number)).length;
}

export function getCardIn(from: Card[], type: ECardTypes, number?: number): Card | undefined {
  return from.find(card => card.theSameType(type, number));
}

export function getCardsIn(from: Card[], type: ECardTypes, number?: number): Card[] {
  return from.filter(card => card.theSameType(type, number));
}

export function getTotalDamage(damage: number, attacker?: Player): number {
  const countPlace6 = attacker?.getCountCards('activePermanent', ECardTypes.places, 6) || 0;
  return countPlace6
    ? (2 * countPlace6) * damage
    : damage;
}

export function getCardsExceptCards(from: Card[], exceptCards: Card[]): Card[] {
  return from.reduce((cards: Card[], card) => {
    if (!exceptCards.some(c => card.theSame(c))) {
      cards.push(card);
    }
    return cards;
  }, []);
}

export function getLastElement<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

export function getSkullsExceptSkulls(from: Skull[], exceptSkulls: Skull[]): Skull[] {
  return from.reduce((skulls: Skull[], skull) => {
    if (!exceptSkulls.includes(skull)) {
      skulls.push(skull);
    }
    return skulls;
  }, []);
}

export function getPropsExceptProps(from: Prop[], exceptProps: Prop[]): Prop[] {
  return from.reduce((props: Prop[], prop) => {
    if (!exceptProps.some(p => p.id === prop.id)) {
      props.push(prop);
    }
    return props;
  }, []);
}

export function sleep(timeMs: number): Promise<void> {
  return new Promise(res => {
    setTimeout(res, timeMs);
  });
}

export function toPlayerVariant(player: Player): TVariant {
  return { id: player.nickname, value: player.nickname };
}

export function getCardsInFromClient(clientCards: TCard[], from: Card[]): Card[] {
  return from.filter(card => clientCards.some(c => c.id === card.id));
}

export function getPropsInFromClient(clientProps: TProp[], from: Prop[]): Prop[] {
  return from.filter(prop => clientProps.some(p => p.id === prop.id));
}

export function getSkullsInFromClient(clientSkulls: TSkull[], from: Skull[]): Skull[] {
  return from.filter(skull => clientSkulls.some(s => s.id === skull.id));
}

export function getCardInFromClient(clientCard: TCard, from: Card[]): Card | undefined {
  return from.find(c => c.id === clientCard.id);
}

export function getPropInFromClient(clientProp: TProp, from: Prop[]): Prop | undefined {
  return from.find(p =>p.id === clientProp.id);
}

export function getSkullInFromClient(clientSkull: TSkull, from: Skull[]): Skull | undefined {
  return from.find(s => s.id === clientSkull.id);
}

export function getMinHpPlayers(players: Player[]): Player[] {
  return players.reduce<Player[]>((acc, currentTarget) => {
    if (currentTarget.hp === acc[0]?.hp) {
      acc.push(currentTarget);
    } else if (!acc[0] || currentTarget.hp < acc[0]?.hp) {
      acc = [currentTarget];
    }
    return acc;
  }, []);
}

export function getMaxHpPlayers(players: Player[]): Player[] {
  return players.reduce<Player[]>((acc, currentTarget) => {
    if (currentTarget.hp === acc[0]?.hp) {
      acc.push(currentTarget);
    } else if (!acc[0] || currentTarget.hp > acc[0].hp) {
      acc = [currentTarget];
    }
    return acc;
  }, []);
}

export function getMaxCostCards(cards: Card[], forPlayer: Player): Card[] {
  return cards.reduce<[Card[], number]>((acc, card) => {
    const cost = card.getTotalCost(forPlayer);
    if (cost === acc[1]) {
      acc[0].push(card);
    } else if (cost > acc[1]) {
      acc[0] = [card];
      acc[1] = cost;
    }
    return acc;
  }, [[], 0])[0];
}

export function getMinCostCards(cards: Card[], forPlayer: Player): Card[] {
  return cards.reduce<[Card[], number]>((acc, card) => {
    const cost = card.getTotalCost(forPlayer);
    if (cost === acc[1]) {
      acc[0].push(card);
    } else if (cost < acc[1]) {
      acc[0] = [card];
      acc[1] = cost;
    }
    return acc;
  }, [[], 999])[0];
}
