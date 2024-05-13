export enum ECardTypes {
  back = 'back',
  crazyMagic = 'crazyMagic',
  creatures = 'creatures',
  familiars = 'familiars',
  lawlessnesses = 'lawlessnesses',
  legends = 'legends',
  places = 'places',
  seeds = 'seeds',
  sluggishStick = 'sluggishStick',
  spells = 'spells',
  treasures = 'treasures',
  wizards = 'wizards',
}

export enum ECardTypeSprites {
  creatures = 'creatures',
  familiars = 'familiars',
  lawlessnesses = 'lawlessnesses',
  legends = 'legends',
  places = 'places',
  seeds = 'seeds',
  spells = 'spells',
  treasures = 'treasures',
  wizards = 'wizards',
}

export interface TCard {
  number: number | null;
  ownerNickname: string | undefined;
  totalCost: number | undefined;
  id: string | number;
  canPlay: boolean;
  type: ECardTypes;
  data: unknown;
}
