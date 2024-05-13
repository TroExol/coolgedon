import type { TCard, TSkull, TVariant } from '@coolgedon/shared';

import type { Skull } from 'Entity/skull';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

export interface TSelectGuardCardParams {
    cardAttack: Card;
    cardsToShow?: Card[];
    title?: string;
}

export type TSelectGuardCardResult = Card | undefined;

export interface TSelectGuardCardWsResult {
    selectedCard: TCard;
    closed?: boolean;
}

export interface TDamageParams {
    attacker?: Player;
    damage: number;
    giveSkull?: boolean;
}

export interface TGuardParams {
    attacker?: Player;
    title?: string;
    byLawlessness?: boolean;
    cardAttack: Card;
    damage?: number;
    cardsToShow?: Card[];
}

export interface TSelectCardsParams {
    cards: Card[];
    variants: TVariant[];
    count?: number;
    title?: string;
    canClose?: boolean;
}

export interface TSelectCardsResult {
    cards: Card[];
    variant?: number | string;
}

export interface TSelectCardsWsResult {
    selectedCards: TCard[];
    variant?: number | string;
    closed?: boolean;
}

export interface TSelectSkullsParams {
    skulls: Skull[];
    variants: TVariant[];
    count?: number;
    title?: string;
    canClose?: boolean;
}

export interface TSelectSkullsResult {
    skulls: Skull[];
    variant?: number | string;
}

export interface TSelectSkullsWsResult {
    selectedSkulls: TSkull[];
    variant?: number | string;
    closed?: boolean;
}

export interface TSelectVariantParams {
    variants: TVariant[];
    title?: string;
    canClose?: boolean;
}

export type TSelectVariantResult<T extends TVariant['id']> = T | undefined;

export interface TSelectVariantWsResult<T> {
    variant?: T;
    closed?: boolean;
}

export interface TSelectTargetParams {
    targetsToSelect?: Player[];
    target?: Player;
    title?: string;
    canClose?: boolean;
}

export interface TSelectLeftUniqueCardTypesParams {
    cards: Card[];
    canClose?: boolean;
}

export interface TSelectLeftUniqueCardTypesWsResult {
    selectedCards: TCard[];
    closed?: boolean;
}
