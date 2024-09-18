import type { TVariant } from './variant';
import type { TSkull } from './skull';
import type { TProp } from './prop';
import type { TPlayer } from './player';
import type { TCard } from './card';

export enum EModalTypes {
  cards = 'cards',
  endGame = 'end-game',
  leftUniqueCardTypes = 'left-unique-card-types',
  playCard = 'play-card',
  selectCards = 'select-cards',
  selectSkulls = 'select-skulls',
  selectStartCards = 'select-start-cards',
  selectVariant = 'select-variant',
  skulls = 'skills',
  suggestGuard = 'suggest-guard',
}

export type TModalParams<T extends EModalTypes> =
  { canClose?: boolean; canCollapse?: boolean; } & (
  T extends EModalTypes.selectStartCards ? { familiars: TCard[]; props: TProp[]; }
  : T extends EModalTypes.selectCards ? { cards: TCard[]; title?: string; count: number; variants: TVariant[]; }
  : T extends EModalTypes.cards ? { cards: TCard[]; title?: string; }
  : T extends EModalTypes.playCard ? { card: TCard; }
  : T extends EModalTypes.suggestGuard ? { cards: TCard[]; cardAttack: TCard; cardsToShow?: TCard[]; title?: string; }
  : T extends EModalTypes.leftUniqueCardTypes ? { cards: TCard[]; }
  : T extends EModalTypes.selectSkulls ? { skulls: TSkull[]; count: number; title?: string; variants: TVariant[]; }
  : T extends EModalTypes.selectVariant ? { title?: string; variants: TVariant[]; }
  : T extends EModalTypes.endGame ? { players: TPlayer[]; }
  : never);

export type TModalResponse<T extends EModalTypes> =
  T extends EModalTypes.selectStartCards ? { familiar: TCard; prop: TProp; }
  : T extends EModalTypes.selectCards
      ? { selectedCards: TCard[]; variant?: number | string; closed?: never }
        | { closed: true; selectedCards?: never; variant?: never; }
  : T extends EModalTypes.suggestGuard
      ? { selectedCard: TCard; closed?: never; }
        | { selectedCard?: never; closed: true; }
  : T extends EModalTypes.leftUniqueCardTypes
      ? { selectedCards: TCard[]; closed?: never; }
        | { selectedCards?: never; closed: true; }
  : T extends EModalTypes.selectSkulls
      ? { selectedSkulls: TSkull[]; variant?: number | string; closed?: never; }
        | { selectedSkulls?: never; variant?: never; closed: true; }
  : T extends EModalTypes.selectVariant
      ? { variant?: TVariant['id']; closed?: never; }
        | { variant?: never; closed: true; }
  : never;
