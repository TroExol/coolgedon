// eslint-disable-next-line max-classes-per-file
import type { ReactNode } from 'react';

import { makeAutoObservable } from 'mobx';

type TContent = ReactNode | (() => ReactNode)

export class Modal {
  canClose = true;
  canCollapse = true;
  content: TContent = null;
  onClose?: () => void;

  constructor(content: TContent, options?: {
    canClose?: boolean,
    canCollapse?: boolean,
    onClose?: () => void
  }) {
    if (options) {
      this.canClose = options.canClose ?? true;
      this.canCollapse = options.canCollapse ?? true;
      this.onClose = options.onClose;
    }
    this.content = content;
  }
}

export class ModalsStore {
  collapsed = false;

  modals: Modal[] = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  close(notSelected = true) {
    if (!this?.modals[0]) {
      return;
    }
    if (notSelected) {
      this.modals[0].onClose?.();
    }
    this.modals.shift();
    this.collapsed = false;
  }

  closeAll() {
    if (!this?.modals[0]) {
      return;
    }
    this.modals = [];
    this.collapsed = false;
  }

  show(content: TContent, options?: {
    canClose?: boolean,
    canCollapse?: boolean,
    onClose?: () => void
  }) {
    this.modals.push(new Modal(content, options));
  }

  toggleCollapsed() {
    if (!this?.modals[0] || !this.modals[0].canCollapse) {
      return;
    }
    this.collapsed = !this.collapsed;
  }
}

export const modalsStore = new ModalsStore();
