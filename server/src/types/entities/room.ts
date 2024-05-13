import type { Card } from 'Entity/card';

export interface TFillShopParams {
  canLawlessnesses?: boolean;
  replaceCards?: Card[];
}

export interface TWsRequestQueueValue {
  resolve: (data: unknown) => void;
  reject: (error: Error) => void;
  roomName: string;
  receiverNickname: string;
}
