import type {
  TPlayCardByLawlessnessParams,
  TPlayGroupAttackParams,
  TPlayLawlessnessParams,
  TPlayPermanentParams,
  TSimplePlayCardParams,
} from 'Type/events/playCard';
import type { Player } from 'Entity/player';

export interface TCanPlayAttackParams {
    // На кого конкретного собирается атака
    target?: Player;
    // Кто конкретный разыгрывает атаку
    player?: Player;
}

export interface TCanPlayParams {
    // На кого конкретного собирается разыгрывать
    target?: Player;
    // Кто конкретный разыгрывает карту
    player?: Player;
}

export interface TGetFinalDamageParams {
    concreteDamage?: number;
    target: Player;
    attacker?: Player;
}

export type TPlayParams =
    | { type: 'simple'; params?: Omit<TSimplePlayCardParams, 'room' | 'card'>; }
    | { type: 'groupAttack'; params?: Omit<TPlayGroupAttackParams, 'room' | 'card'>; }
    | { type: 'byLawlessness'; params?: Omit<TPlayCardByLawlessnessParams, 'room' | 'card'>; }
    | { type: 'permanent'; params?: Omit<TPlayPermanentParams, 'room' | 'card'>; }
    | { type: 'lawlessness'; params: Omit<TPlayLawlessnessParams, 'room' | 'card'>; };
