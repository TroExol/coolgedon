import type { EEventTypes, TClientToServerEvents } from '@coolgedon/shared';

import { rooms } from 'Entity/room';

export const countRooms = (callback: Parameters<TClientToServerEvents[EEventTypes.countRooms]>[0]) => {
  callback(Object.keys(rooms).length);
};
