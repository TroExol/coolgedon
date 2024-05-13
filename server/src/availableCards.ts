/* eslint-disable max-len,object-curly-newline */
import { ECardTypes } from '@coolgedon/shared';

import type { Room } from 'Entity/room';

import { Skull } from 'Entity/skull';
import { Prop } from 'Entity/prop';
import { Card } from 'Entity/card';

export type TAvailableCards = Record<Exclude<ECardTypes, ECardTypes.back | ECardTypes.seeds>, Card[]> & {
  skulls: Skull[];
  props: Prop[];
}

export const propMap = {
  1: { id: 1, playable: false },
  2: { id: 2, playable: false },
  3: { id: 3, playable: false },
  4: { id: 4, playable: true },
  5: { id: 5, playable: false },
  6: { id: 6, playable: false },
  7: { id: 7, playable: false },
  8: { id: 8, playable: false },
};

export const cardMap = {
  [ECardTypes.sluggishStick]: { number: null, type: ECardTypes.sluggishStick, victoryPoints: -1, power: 0, cost: 0, playable: false, canGuard: false, permanent: false },
  [ECardTypes.crazyMagic]: { number: null, type: ECardTypes.crazyMagic, victoryPoints: 1, power: 0, cost: 3, playable: true, canGuard: false, permanent: false },

  [ECardTypes.seeds]: {
    1: { type: ECardTypes.seeds, number: 1, victoryPoints: 0, power: 1, cost: 0, playable: false, canGuard: false, permanent: false },
    2: { type: ECardTypes.seeds, number: 2, victoryPoints: 0, power: 1, cost: 0, playable: true, canGuard: false, permanent: false },
    3: { type: ECardTypes.seeds, number: 3, victoryPoints: 0, power: 0, cost: 0, playable: false, canGuard: false, permanent: false },
  },

  [ECardTypes.lawlessnesses]: {
    1: { type: ECardTypes.lawlessnesses, number: 1, victoryPoints: 0, power: 0, cost: 0, playable: true, canGuard: false, permanent: false },
    2: { type: ECardTypes.lawlessnesses, number: 2, victoryPoints: 0, power: 0, cost: 0, playable: true, canGuard: false, permanent: false },
    4: { type: ECardTypes.lawlessnesses, number: 4, victoryPoints: 0, power: 0, cost: 0, playable: true, canGuard: false, permanent: false },
    5: { type: ECardTypes.lawlessnesses, number: 5, victoryPoints: 0, power: 0, cost: 0, playable: true, canGuard: false, permanent: false },
    7: { type: ECardTypes.lawlessnesses, number: 7, victoryPoints: 0, power: 0, cost: 0, playable: true, canGuard: false, permanent: false },
    8: { type: ECardTypes.lawlessnesses, number: 8, victoryPoints: 0, power: 0, cost: 0, playable: true, canGuard: false, permanent: false },
    9: { type: ECardTypes.lawlessnesses, number: 9, victoryPoints: 0, power: 0, cost: 0, playable: true, canGuard: false, permanent: false },
    10: { type: ECardTypes.lawlessnesses, number: 10, victoryPoints: 0, power: 0, cost: 0, playable: true, canGuard: false, permanent: false },
    11: { type: ECardTypes.lawlessnesses, number: 11, victoryPoints: 0, power: 0, cost: 0, playable: true, canGuard: false, permanent: false },
    13: { type: ECardTypes.lawlessnesses, number: 13, victoryPoints: 0, power: 0, cost: 0, playable: true, canGuard: false, permanent: false },
    14: { type: ECardTypes.lawlessnesses, number: 14, victoryPoints: 0, power: 0, cost: 0, playable: true, canGuard: false, permanent: false },
    16: { type: ECardTypes.lawlessnesses, number: 16, victoryPoints: 0, power: 0, cost: 0, playable: true, canGuard: false, permanent: false },
    18: { type: ECardTypes.lawlessnesses, number: 18, victoryPoints: 0, power: 0, cost: 0, playable: true, canGuard: false, permanent: false },
    19: { type: ECardTypes.lawlessnesses, number: 19, victoryPoints: 0, power: 0, cost: 0, playable: true, canGuard: false, permanent: false },
    22: { type: ECardTypes.lawlessnesses, number: 22, victoryPoints: 0, power: 0, cost: 0, playable: true, canGuard: false, permanent: false },
    24: { type: ECardTypes.lawlessnesses, number: 24, victoryPoints: 0, power: 0, cost: 0, playable: true, canGuard: false, permanent: false },
    25: { type: ECardTypes.lawlessnesses, number: 25, victoryPoints: 0, power: 0, cost: 0, playable: true, canGuard: false, permanent: false },
    26: { type: ECardTypes.lawlessnesses, number: 26, victoryPoints: 0, power: 0, cost: 0, playable: true, canGuard: false, permanent: false },
  },

  [ECardTypes.familiars]: {
    1: { type: ECardTypes.familiars, number: 1, victoryPoints: 2, power: 2, cost: 6, playable: true, canGuard: true, permanent: false },
    2: { type: ECardTypes.familiars, number: 2, victoryPoints: 2, power: 3, cost: 6, playable: false, canGuard: true, permanent: false },
    3: { type: ECardTypes.familiars, number: 3, victoryPoints: 2, power: 2, cost: 6, playable: true, canGuard: true, permanent: false },
    4: { type: ECardTypes.familiars, number: 4, victoryPoints: 2, power: 2, cost: 6, playable: true, canGuard: true, permanent: false },
    // 5: { type: ECardTypes.familiars, number: 5, victoryPoints: 2, power: 2, cost: 6, playable: true, canGuard: true, permanent: false }, //
    6: { type: ECardTypes.familiars, number: 6, victoryPoints: 2, power: 3, cost: 6, playable: false, canGuard: true, permanent: false },
    7: { type: ECardTypes.familiars, number: 7, victoryPoints: 2, power: 2, cost: 6, playable: false, canGuard: true, permanent: false },
    8: { type: ECardTypes.familiars, number: 8, victoryPoints: 2, power: 0, cost: 6, playable: false, canGuard: true, permanent: false },
    9: { type: ECardTypes.familiars, number: 9, victoryPoints: 2, power: 2, cost: 6, playable: true, canGuard: true, permanent: false },
    10: { type: ECardTypes.familiars, number: 10, victoryPoints: 2, power: 2, cost: 6, playable: true, canGuard: true, permanent: false },
    11: { type: ECardTypes.familiars, number: 11, victoryPoints: 2, power: 3, cost: 6, playable: true, canGuard: true, permanent: false },
    12: { type: ECardTypes.familiars, number: 12, victoryPoints: 2, power: 2, cost: 6, playable: true, canGuard: true, permanent: false },
  },

  [ECardTypes.legends]: {
    1: { type: ECardTypes.legends, number: 1, victoryPoints: 4, power: 1, cost: 8, playable: true, canGuard: false, permanent: false },
    2: { type: ECardTypes.legends, number: 2, victoryPoints: 5, power: 2, cost: 10, playable: true, canGuard: false, permanent: false },
    3: { type: ECardTypes.legends, number: 3, victoryPoints: 5, power: 2, cost: 9, playable: true, canGuard: false, permanent: false },
    4: { type: ECardTypes.legends, number: 4, victoryPoints: 6, power: 4, cost: 12, playable: true, canGuard: false, permanent: false },
    5: { type: ECardTypes.legends, number: 5, victoryPoints: 6, power: 0, cost: 11, playable: true, canGuard: false, permanent: false },
    // 6: { type: ECardTypes.legends, number: 6, victoryPoints: 5, power: 0, cost: 10, playable: true, canGuard: false, permanent: false }, //
    7: { type: ECardTypes.legends, number: 7, victoryPoints: 6, power: 0, cost: 11, playable: true, canGuard: false, permanent: false },
    8: { type: ECardTypes.legends, number: 8, victoryPoints: 5, power: 0, cost: 9, playable: true, canGuard: false, permanent: false },
    // 9: { type: ECardTypes.legends, number: 9, victoryPoints: 5, power: 0, cost: 9, playable: true, canGuard: false, permanent: false }, //
    10: { type: ECardTypes.legends, number: 10, victoryPoints: 5, power: 2, cost: 10, playable: true, canGuard: false, permanent: false },
    11: { type: ECardTypes.legends, number: 11, victoryPoints: 6, power: 0, cost: 12, playable: false, canGuard: false, permanent: false },
    12: { type: ECardTypes.legends, number: 12, victoryPoints: 5, power: 3, cost: 10, playable: true, canGuard: false, permanent: false },
  },

  [ECardTypes.creatures]: {
    1: { type: ECardTypes.creatures, number: 1, victoryPoints: 1, power: 2, cost: 4, playable: true, canGuard: false, permanent: false },
    2: { type: ECardTypes.creatures, number: 2, victoryPoints: 1, power: 2, cost: 5, playable: true, canGuard: false, permanent: false },
    3: { type: ECardTypes.creatures, number: 3, victoryPoints: 1, power: 1, cost: 3, playable: true, canGuard: false, permanent: false },
    4: { type: ECardTypes.creatures, number: 4, victoryPoints: 1, power: 0, cost: 5, playable: true, canGuard: false, permanent: false },
    5: { type: ECardTypes.creatures, number: 5, victoryPoints: 1, power: 0, cost: 4, playable: true, canGuard: false, permanent: false },
    6: { type: ECardTypes.creatures, number: 6, victoryPoints: 1, power: 2, cost: 3, playable: true, canGuard: false, permanent: false },
    7: { type: ECardTypes.creatures, number: 7, victoryPoints: 2, power: 2, cost: 6, playable: false, canGuard: true, permanent: false },
    8: { type: ECardTypes.creatures, number: 8, victoryPoints: 1, power: 2, cost: 2, playable: false, canGuard: false, permanent: false },
    9: { type: ECardTypes.creatures, number: 9, victoryPoints: 1, power: 2, cost: 4, playable: false, canGuard: true, permanent: false },
    10: { type: ECardTypes.creatures, number: 10, victoryPoints: 2, power: 2, cost: 6, playable: true, canGuard: false, permanent: false },
    11: { type: ECardTypes.creatures, number: 11, victoryPoints: 1, power: 1, cost: 3, playable: false, canGuard: false, permanent: false },
    12: { type: ECardTypes.creatures, number: 12, victoryPoints: 1, power: 2, cost: 5, playable: true, canGuard: false, permanent: false },
    13: { type: ECardTypes.creatures, number: 13, victoryPoints: 3, power: 0, cost: 7, playable: true, canGuard: false, permanent: false },
  },

  [ECardTypes.places]: {
    1: { type: ECardTypes.places, number: 1, victoryPoints: 1, power: 0, cost: 5, playable: false, canGuard: false, permanent: true },
    2: { type: ECardTypes.places, number: 2, victoryPoints: 1, power: 0, cost: 5, playable: false, canGuard: false, permanent: true },
    3: { type: ECardTypes.places, number: 3, victoryPoints: 1, power: 0, cost: 5, playable: false, canGuard: false, permanent: true },
    4: { type: ECardTypes.places, number: 4, victoryPoints: 1, power: 0, cost: 5, playable: false, canGuard: false, permanent: true },
    5: { type: ECardTypes.places, number: 5, victoryPoints: 1, power: 0, cost: 5, playable: false, canGuard: false, permanent: true },
    6: { type: ECardTypes.places, number: 6, victoryPoints: 2, power: 0, cost: 7, playable: false, canGuard: false, permanent: true },
  },

  [ECardTypes.spells]: {
    // 1: { type: ECardTypes.spells, number: 1, victoryPoints: 1, power: 1, cost: 2, playable: false, canGuard: false, permanent: false }, //
    // 2: { type: ECardTypes.spells, number: 2, victoryPoints: 1, power: 0, cost: 5, playable: true, canGuard: false, permanent: false }, //
    3: { type: ECardTypes.spells, number: 3, victoryPoints: 3, power: 3, cost: 5, playable: false, canGuard: false, permanent: false },
    4: { type: ECardTypes.spells, number: 4, victoryPoints: 1, power: 2, cost: 3, playable: true, canGuard: false, permanent: false },
    5: { type: ECardTypes.spells, number: 5, victoryPoints: 1, power: 0, cost: 3, playable: true, canGuard: true, permanent: false },
    6: { type: ECardTypes.spells, number: 6, victoryPoints: 1, power: 0, cost: 4, playable: true, canGuard: false, permanent: false },
    7: { type: ECardTypes.spells, number: 7, victoryPoints: 1, power: 2, cost: 4, playable: false, canGuard: true, permanent: false },
    8: { type: ECardTypes.spells, number: 8, victoryPoints: 1, power: 0, cost: 4, playable: true, canGuard: false, permanent: false },
    9: { type: ECardTypes.spells, number: 9, victoryPoints: 1, power: 0, cost: 5, playable: true, canGuard: false, permanent: false },
    10: { type: ECardTypes.spells, number: 10, victoryPoints: 2, power: 3, cost: 6, playable: true, canGuard: false, permanent: false },
    // 11: { type: ECardTypes.spells, number: 11, victoryPoints: 2, power: 3, cost: 6, playable: true, canGuard: false, permanent: false }, //
    12: { type: ECardTypes.spells, number: 12, victoryPoints: 1, power: 1, cost: 3, playable: true, canGuard: false, permanent: false },
    13: { type: ECardTypes.spells, number: 13, victoryPoints: 2, power: 3, cost: 7, playable: true, canGuard: false, permanent: false },
  },

  [ECardTypes.treasures]: {
    1: { type: ECardTypes.treasures, number: 1, victoryPoints: 1, power: 2, cost: 5, playable: true, canGuard: false, permanent: false },
    2: { type: ECardTypes.treasures, number: 2, victoryPoints: 0, power: 0, cost: 5, playable: true, canGuard: true, permanent: true },
    3: { type: ECardTypes.treasures, number: 3, victoryPoints: 1, power: 0, cost: 3, playable: false, canGuard: false, permanent: true },
    4: { type: ECardTypes.treasures, number: 4, victoryPoints: 1, power: 2, cost: 5, playable: true, canGuard: false, permanent: false },
    5: { type: ECardTypes.treasures, number: 5, victoryPoints: 2, power: 3, cost: 6, playable: false, canGuard: true, permanent: false },
    6: { type: ECardTypes.treasures, number: 6, victoryPoints: 1, power: 0, cost: 4, playable: true, canGuard: false, permanent: false },
    7: { type: ECardTypes.treasures, number: 7, victoryPoints: 1, power: 1, cost: 4, playable: true, canGuard: false, permanent: false },
    8: { type: ECardTypes.treasures, number: 8, victoryPoints: 2, power: 5, cost: 7, playable: false, canGuard: false, permanent: false },
    9: { type: ECardTypes.treasures, number: 9, victoryPoints: 2, power: 3, cost: 6, playable: true, canGuard: false, permanent: false },
    10: { type: ECardTypes.treasures, number: 10, victoryPoints: 1, power: 0, cost: 4, playable: true, canGuard: false, permanent: false },
    // 11: { type: ECardTypes.treasures, number: 11, victoryPoints: 1, power: 2, cost: 3, playable: true, canGuard: false, permanent: false }, //
    12: { type: ECardTypes.treasures, number: 12, victoryPoints: 1, power: 1, cost: 2, playable: false, canGuard: true, permanent: false },
    13: { type: ECardTypes.treasures, number: 13, victoryPoints: 0, power: 0, cost: 3, playable: false, canGuard: false, permanent: true },
  },

  [ECardTypes.wizards]: {
    1: { type: ECardTypes.wizards, number: 1, victoryPoints: 2, power: 2, cost: 7, playable: true, canGuard: false, permanent: false },
    2: { type: ECardTypes.wizards, number: 2, victoryPoints: 1, power: 2, cost: 5, playable: false, canGuard: true, permanent: false },
    3: { type: ECardTypes.wizards, number: 3, victoryPoints: 1, power: 2, cost: 5, playable: true, canGuard: false, permanent: false },
    4: { type: ECardTypes.wizards, number: 4, victoryPoints: 1, power: 0, cost: 2, playable: true, canGuard: false, permanent: false },
    5: { type: ECardTypes.wizards, number: 5, victoryPoints: 1, power: 2, cost: 4, playable: true, canGuard: false, permanent: false },
    6: { type: ECardTypes.wizards, number: 6, victoryPoints: 1, power: 2, cost: 3, playable: true, canGuard: false, permanent: false },
    7: { type: ECardTypes.wizards, number: 7, victoryPoints: 1, power: 1, cost: 3, playable: true, canGuard: true, permanent: false },
    8: { type: ECardTypes.wizards, number: 8, victoryPoints: 1, power: 1, cost: 3, playable: true, canGuard: false, permanent: false },
    9: { type: ECardTypes.wizards, number: 9, victoryPoints: 1, power: 0, cost: 4, playable: true, canGuard: false, permanent: false },
    10: { type: ECardTypes.wizards, number: 10, victoryPoints: 1, power: 0, cost: 4, playable: true, canGuard: false, permanent: false },
    11: { type: ECardTypes.wizards, number: 11, victoryPoints: 1, power: 2, cost: 5, playable: true, canGuard: false, permanent: false },
    12: { type: ECardTypes.wizards, number: 12, victoryPoints: 2, power: 0, cost: 6, playable: true, canGuard: false, permanent: false },
    13: { type: ECardTypes.wizards, number: 13, victoryPoints: 3, power: 5, cost: 6, playable: false, canGuard: false, permanent: false },
  },
};

export const getAvailableCards = (room: Room): TAvailableCards => {
  let cardId = 1;
  const cardFactory = (params: Omit<ConstructorParameters<typeof Card>[0], 'id' | 'room'>) => new Card({ ...params, id: cardId++, room });
  const propFactory = (params: Omit<ConstructorParameters<typeof Prop>[0], 'room'>) => new Prop({ ...params, room });
  const skullFactory = (params: Omit<ConstructorParameters<typeof Skull>[0], 'room'>) => new Skull({ ...params, room });

  return {
    skulls: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(id => skullFactory({ id })),
    props: Object.values(propMap).map(prop => propFactory(prop)),
    lawlessnesses: Object.values(cardMap[ECardTypes.lawlessnesses]).map(card => cardFactory(card)),
    crazyMagic: Array.from({ length: 16 }, () => cardFactory(cardMap[ECardTypes.crazyMagic])),
    sluggishStick: Array.from({ length: 16 }, () => cardFactory(cardMap[ECardTypes.sluggishStick])),
    familiars: Object.values(cardMap[ECardTypes.familiars]).map(card => cardFactory(card)),
    legends: Object.values(cardMap[ECardTypes.legends]).map(card => cardFactory(card)),
    places: Object.values(cardMap[ECardTypes.places]).map(card => cardFactory(card)),
    creatures: Object.values(cardMap[ECardTypes.creatures]).flatMap(card => card.cost < 6
      ? [cardFactory(card), cardFactory(card)]
      : cardFactory(card)),
    spells: Object.values(cardMap[ECardTypes.spells]).flatMap(card => card.cost < 6
      ? [cardFactory(card), cardFactory(card)]
      : cardFactory(card)),
    treasures: Object.values(cardMap[ECardTypes.treasures]).flatMap(card => card.cost < 6
      ? [cardFactory(card), cardFactory(card)]
      : cardFactory(card)),
    wizards: Object.values(cardMap[ECardTypes.wizards]).flatMap(card => card.cost < 6
      ? [cardFactory(card), cardFactory(card)]
      : cardFactory(card)),
  };
};
