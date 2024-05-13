import { ECardTypes } from './types/card';

export const isCardTypeWithNumber = (cardType: ECardTypes): boolean => {
  return [
    ECardTypes.familiars,
    ECardTypes.lawlessnesses,
    ECardTypes.legends,
    ECardTypes.places,
    ECardTypes.seeds,
    ECardTypes.spells,
    ECardTypes.treasures,
    ECardTypes.wizards,
  ].includes(cardType);
};
