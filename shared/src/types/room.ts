import type { TSkull } from './skull';
import type { TProp } from './prop';
import type { TPlayer } from './player';
import type { TCard } from './card';

export interface TRoom {
  activeLawlessness: TCard | undefined,
  activePlayerNickname: string;
  playerNickname: string;
  adminNickname: string;
  deck: TCard[];
  gameEnded: boolean;
  legends: TCard[];
  name: string;
  players: Record<string, TPlayer>;
  props: TProp[];
  removed: {
    cards: TCard[];
    lawlessnesses: TCard[];
  };
  shop: TCard[];
  skulls: TSkull[];
  crazyMagic: TCard[];
  sluggishStick: TCard[];
}
