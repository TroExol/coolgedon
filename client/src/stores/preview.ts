// eslint-disable-next-line max-classes-per-file
import type { ReactNode } from 'react';

import { makeAutoObservable } from 'mobx';

export class PreviewStore {
  content: ReactNode = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  close() {
    this.content = null;
  }

  show(content: ReactNode) {
    this.content = content;
  }
}

export const previewStore = new PreviewStore();
