import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';
import type { Card } from 'Entity/card';

export interface TPlayCardHandlerGeneralParams {
    room: Room;
    card: Card;
    player: Player;
    byLawlessness?: boolean;
}

// simplePlayCard
export interface TSimplePlayCardParams {
    room: Room;
    card: Card;
    target?: Player;
    attacker?: Player;
    cardUsedByPlayer?: boolean;
    canGuard?: boolean;
    damage?: number;
}

export interface TSimplePlayCardHandlerPartByLawlessnessParams {
    byLawlessness: false | undefined;
    target?: Player;
    damage?: number;
    markAsPlayed: () => void;
    canGuard: boolean;
    cardUsedByPlayer: boolean;
    attacker: Player;
}

export type TSimplePlayCardHandlerParams =
    TSimplePlayCardHandlerPartByLawlessnessParams & TPlayCardHandlerGeneralParams;

// playCardByLawlessness
export interface TPlayCardByLawlessnessParams {
    room: Room;
    card: Card;
    target?: Player;
}

export interface TPlayCardByLawlessnessHandlerPartByLawlessnessParams {
    byLawlessness: true;
    target?: Player;
    cardUsedByPlayer: false;
    canGuard: true;
    attacker?: never;
    damage?: never;
    markAsPlayed?: never;
}

export type TPlayCardByLawlessnessHandlerParams =
    TPlayCardHandlerGeneralParams & TPlayCardByLawlessnessHandlerPartByLawlessnessParams;

// playLawlessness
export interface TPlayLawlessnessParams {
    room: Room;
    card: Card;
}

export interface TPlayLawlessnessHandlerParams {
    room: Room;
    card: Card;
}

// playPermanent
export interface TPlayPermanentParams {
    room: Room;
    card: Card;
    initPermanent?: boolean;
}

export interface TPlayPermanentHandlerParams {
    room: Room;
    card: Card;
    initPermanent?: boolean;
}

// playGroupAttack
export interface TPlayGroupAttackParams {
    room: Room;
    card: Card;
    target?: Player;
    byLawlessness?: boolean;
}

export type TPlayCardHandler =
    (params: TPlayCardHandlerGeneralParams & (
        | TSimplePlayCardHandlerPartByLawlessnessParams
        | TPlayCardByLawlessnessHandlerPartByLawlessnessParams
        )) => Promise<void>;
