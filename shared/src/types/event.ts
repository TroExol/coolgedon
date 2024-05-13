import type { TRoom } from './room';
import type { TProp } from './prop';
import type { TModalParams } from './modal';
import type { TLog } from './log';
import type { TCard } from './card';

export enum EEventTypes {
  buyCrazyMagicCard = 'buy-crazy-magic-card',
  buyFamiliarCard = 'buy-familiar-card',
  buyLegendCard = 'buy-legend-card',
  buyShopCard = 'buy-shop-card',
  cancelSelectStartCards = 'cancel-select-start-cards',
  disconnect = 'disconnect',
  endTurn = 'end-turn',
  joinPlayer = 'join-player',
  ping = 'ping',
  playAllCards = 'play-all-cards',
  playCard = 'play-card',
  playProp = 'play-prop',
  removePlayer = 'remove-player',
  reset = 'reset',
  sendLogs = 'send-logs',
  showModal = 'show-modal',
  updateInfo = 'update-info',
}

type TEventSendFromClientWithData<T extends EEventTypes, U> = { event: T; data: U; requestId?: never };
type TEventSendFromClientWithoutData<T extends EEventTypes> = { event: T; data?: never; requestId?: never };

export type TEventSendFromClientParams =
  { roomName: string; } & (
    | { event?: never; requestId: string; data?: unknown; }
    | TEventSendFromClientWithData<EEventTypes.joinPlayer, { nickname: string }>
    | TEventSendFromClientWithData<EEventTypes.cancelSelectStartCards, { familiars: TCard[]; props: TProp[] }>
    | TEventSendFromClientWithData<EEventTypes.removePlayer, { nickname: string }>
    | TEventSendFromClientWithData<EEventTypes.buyShopCard, { card: TCard }>
    | TEventSendFromClientWithData<EEventTypes.playCard, { card: TCard }>
    | TEventSendFromClientWithData<EEventTypes.playProp, { prop: TProp }>
    | TEventSendFromClientWithData<EEventTypes.disconnect, { nickname: string }>
    | TEventSendFromClientWithoutData<EEventTypes.buyLegendCard>
    | TEventSendFromClientWithoutData<EEventTypes.buyCrazyMagicCard>
    | TEventSendFromClientWithoutData<EEventTypes.buyFamiliarCard>
    | TEventSendFromClientWithoutData<EEventTypes.endTurn>
    | TEventSendFromClientWithoutData<EEventTypes.reset>
    | TEventSendFromClientWithoutData<EEventTypes.playAllCards>
    | TEventSendFromClientWithoutData<EEventTypes.ping>
  );

type TEventSendFromServerWithData<T extends EEventTypes, U> = { event: T; data: U; };
type TEventSendFromServerWithoutData<T extends EEventTypes> = { event: T; data?: never;};

export type TEventSendFromServerParams =
  { requestId?: string; } & (
    | TEventSendFromServerWithData<EEventTypes.showModal, TModalParams>
    | TEventSendFromServerWithData<EEventTypes.updateInfo, TRoom>
    | TEventSendFromServerWithData<EEventTypes.sendLogs, TLog[]>
    | TEventSendFromServerWithoutData<EEventTypes.ping>
  );
