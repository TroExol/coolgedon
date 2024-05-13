import type { TVariant } from './variant';
import type { TSkull } from './skull';
import type { TProp } from './prop';
import type { TPlayer } from './player';
import type { TCard } from './card';

export enum EModalTypes {
  cards = 'cards',
  endGame = 'endGame',
  leftUniqueCardTypes = 'leftUniqueCardTypes',
  list = 'list',
  playCard = 'playCard',
  selectStartCards = 'selectStartCards',
  skulls = 'skills',
  suggestGuard = 'suggestGuard',
}

type TModalWithData<T extends EModalTypes, U> = { modalType: T; } & U;
// type TModalWithoutData<T extends EModalTypes> = { modalType: T; };

export type TModalData<T extends EModalTypes> =
  T extends EModalTypes.selectStartCards ? { familiars: TCard[]; props: TProp[]; roomName: string; }
  : T extends EModalTypes.cards ?
    { cards: TCard[]; title?: string; } & (
    | { select: true; count: number; variants: TVariant[]; }
    | { select: false; count?: never; variants?: never; }
    )
  : T extends EModalTypes.playCard ? { card: TCard; }
  : T extends EModalTypes.suggestGuard ? { cards: TCard[]; cardAttack: TCard; cardsToShow?: TCard[]; title?: string; }
  : T extends EModalTypes.leftUniqueCardTypes ? { cards: TCard[]; }
  : T extends EModalTypes.skulls
    ? { skulls: TSkull[]; select: boolean; count: number; title?: string; variants: TVariant[]; }
  : T extends EModalTypes.list ? { title?: string; variants: TVariant[]; }
  : T extends EModalTypes.endGame ? { players: TPlayer[]; }
  : never;

export type TModalParams =
  { canClose?: boolean; canCollapse?: boolean; requestId?: string; modalType: EModalTypes; } & (
  | TModalWithData<EModalTypes.selectStartCards, TModalData<EModalTypes.selectStartCards>>
  | TModalWithData<EModalTypes.cards, TModalData<EModalTypes.cards>>
  | TModalWithData<EModalTypes.playCard, TModalData<EModalTypes.playCard>>
  | TModalWithData<EModalTypes.suggestGuard, TModalData<EModalTypes.suggestGuard>>
  | TModalWithData<EModalTypes.leftUniqueCardTypes, TModalData<EModalTypes.leftUniqueCardTypes>>
  | TModalWithData<EModalTypes.skulls, TModalData<EModalTypes.skulls>>
  | TModalWithData<EModalTypes.list, TModalData<EModalTypes.list>>
  | TModalWithData<EModalTypes.endGame, TModalData<EModalTypes.endGame>>
  );
