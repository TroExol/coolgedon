import type { TRoom } from './room';
import type { TProp } from './prop';
import type { EModalTypes, TModalParams, TModalResponse } from './modal';
import type { TLog } from './log';
import type { TCard } from './card';

export enum EEventTypes {
  buyCrazyMagicCard = 'buy-crazy-magic-card',
  buyFamiliarCard = 'buy-familiar-card',
  buyLegendCard = 'buy-legend-card',
  buyShopCard = 'buy-shop-card',
  countRooms = 'count-rooms',
  endTurn = 'end-turn',
  playAllCards = 'play-all-cards',
  playCard = 'play-card',
  playProp = 'play-prop',
  removePlayer = 'remove-player',
  removeRoom = 'remove-room',
  sendLogs = 'send-logs',
  sendMessage = 'send-message',

  showModalCards = 'show-cards',
  showModalEndGame = 'show-end-game',
  showModalLeftUniqueCardTypes = 'show-left-unique-card-types',
  showModalPlayCard = 'show-play-card',
  showModalSelectCards = 'show-select-cards',
  showModalSelectSkulls = 'show-select-skulls',
  showModalSelectStartCards = 'show-select-start-cards',
  showModalSelectVariant = 'show-select-variant',
  showModalSuggestGuard = 'show-suggest-guard',

  updateInfo = 'update-info',
}

export interface TServerToClientWithAckEvents {
  [EEventTypes.showModalSelectStartCards]: (
    params: TModalParams<EModalTypes.selectStartCards>,
    callback: (params: TModalResponse<EModalTypes.selectStartCards>) => void
  ) => void;
  [EEventTypes.showModalSelectCards]: (
    params: TModalParams<EModalTypes.selectCards>,
    callback: (params: TModalResponse<EModalTypes.selectCards>) => void
  ) => void;
  [EEventTypes.showModalSuggestGuard]: (
    params: TModalParams<EModalTypes.suggestGuard>,
    callback: (params: TModalResponse<EModalTypes.suggestGuard>) => void
  ) => void;
  [EEventTypes.showModalLeftUniqueCardTypes]: (
    params: TModalParams<EModalTypes.leftUniqueCardTypes>,
    callback: (params: TModalResponse<EModalTypes.leftUniqueCardTypes>) => void
  ) => void;
  [EEventTypes.showModalSelectSkulls]: (
    params: TModalParams<EModalTypes.selectSkulls>,
    callback: (params: TModalResponse<EModalTypes.selectSkulls>) => void
  ) => void;
  [EEventTypes.showModalSelectVariant]: (
    params: TModalParams<EModalTypes.selectVariant>,
    callback: (params: TModalResponse<EModalTypes.selectVariant>) => void
  ) => void;
  [EEventTypes.showModalPlayCard]: (
    params: TModalParams<EModalTypes.playCard>,
    callback: () => void
  ) => void;
}

export enum EMessage {
  kicked = 'Вас исключили из игры',
  roomRemoved = 'Комната удалена',
}

export interface TServerToClientWithoutAckEvents {
  [EEventTypes.updateInfo]: (room: TRoom) => void;
  [EEventTypes.sendLogs]: (logs: TLog[]) => void;
  [EEventTypes.showModalEndGame]: (params: TModalParams<EModalTypes.endGame>) => void;
  [EEventTypes.showModalCards]: (params: TModalParams<EModalTypes.cards>) => void;
  [EEventTypes.sendMessage]: (message: EMessage) => void;
}

export type TServerToClientEvents = TServerToClientWithoutAckEvents & TServerToClientWithAckEvents;

export interface TClientToServerEvents {
  [EEventTypes.removePlayer]: (nickname: string) => void;
  [EEventTypes.buyShopCard]: (card: TCard) => void;
  [EEventTypes.playCard]: (card: TCard) => void;
  [EEventTypes.playProp]: (prop: TProp) => void;
  [EEventTypes.buyLegendCard]: () => void;
  [EEventTypes.buyCrazyMagicCard]: () => void;
  [EEventTypes.buyFamiliarCard]: () => void;
  [EEventTypes.endTurn]: () => void;
  [EEventTypes.removeRoom]: () => void;
  [EEventTypes.playAllCards]: () => void;
  [EEventTypes.countRooms]: (
    callback: (count: number) => void
  ) => void;
}
