import type { TSkull } from './skull';
import type { TProp } from './prop';
import type { TCard } from './card';

export interface TPlayer {
  activePermanent: TCard[];
  countDeck: number;
  discard: TCard[];
  familiarToBuy: TCard | undefined;
  hand: TCard[] | undefined;
  countHand: number;
  hasTower: boolean;
  hasTowerC: boolean;
  hp: number;
  nickname: string;
  totalPower: number | undefined;
  props: TProp[];
  skulls: TSkull[];
  victoryPoints: number | undefined;
  isOnline: boolean;
}
