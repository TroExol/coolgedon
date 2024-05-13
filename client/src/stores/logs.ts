import type { TLog } from '@coolgedon/shared';

import { makeAutoObservable } from 'mobx';
import equal from 'fast-deep-equal';

export class LogsStore {
  logs: TLog[] = [];

  constructor(logs: TLog[]) {
    makeAutoObservable(this, {}, { autoBind: true });
    this.update(logs);
  }

  update(logs: TLog[]) {
    if (!equal(this.logs, logs)) {
      this.logs = logs;
    }
  }
}
