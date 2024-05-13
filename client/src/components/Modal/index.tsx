import type { FC, MouseEventHandler } from 'react';

import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import { AnimatePresence, motion } from 'framer-motion';
import classNames from 'classnames';

import { store } from 'Store';
import { onEnter } from 'Helpers';
import { Button } from 'Component/Button';

import styles from './Modal.module.css';

interface TProps {
  className?: string;
}

type TDomElementType = Element & { inert: boolean; };

export const Modal: FC<TProps> = observer(({
  className,
}) => {
  const { modalsStore, previewStore } = store;

  const $container = useRef<HTMLDivElement>(null);
  const [prevFocused, setPrevFocused] = useState<HTMLElement | null>(null);

  const modal = modalsStore.modals[0];
  const display = !!modalsStore.modals.length;

  const onClose = useCallback(() => {
    if (!modal?.canClose || previewStore.content) {
      return;
    }
    modalsStore.close();
  }, [modal?.canClose, modalsStore, previewStore.content]);

  const onClickOutside: MouseEventHandler = useCallback(event => {
    if (event.target !== $container.current) {
      return;
    }
    onClose();
  }, [onClose, $container]);

  const toggleCollapsed = useCallback(() => {
    if (previewStore.content) {
      return;
    }
    modalsStore.toggleCollapsed();
  }, [modalsStore, previewStore.content]);

  const onEsc = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Escape') {
      return;
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (previewStore.content) {
      return;
    }
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onEsc, previewStore.content]);

  useEffect(() => {
    if (!display && !modalsStore.collapsed) {
      return;
    }
    if (!modalsStore.collapsed) {
      setPrevFocused(document.activeElement as HTMLElement);
    }
    const $game = document.querySelector('#game') as TDomElementType;
    if ($game) {
      $game.inert = true;
      return () => {
        $game.inert = false;
      };
    }
  }, [display, modalsStore.collapsed]);

  useEffect(() => {
    if ((display && !modalsStore.collapsed) || !prevFocused) {
      return;
    }
    const $game = document.querySelector('#game') as TDomElementType;
    prevFocused.focus();
    $game.inert = false;
    if (!modalsStore.collapsed) {
      setPrevFocused(null);
    }
  }, [display, modalsStore.collapsed, prevFocused]);

  return (
    <AnimatePresence>
      {display
        ? (
          <motion.div
            animate={{ opacity: 1 }}
            className={classNames(
              styles.container,
              className,
              {
                [styles.collapsed]: modalsStore.collapsed,
              },
            )}
            exit={{ opacity: 0 }}
            id="modal"
            initial={{ opacity: 0 }}
            onClick={onClickOutside}
            ref={$container}
            role="banner"
          >
            <div className={styles.content}>
              <div className={styles.actions}>
                {!modalsStore.collapsed && modal.canCollapse && (
                  <div
                    onClick={toggleCollapsed}
                    onKeyDown={onEnter(toggleCollapsed)}
                    role="button"
                    tabIndex={1}
                  >
                    _
                  </div>
                )}
                {modalsStore.collapsed && (
                  <div
                    onClick={toggleCollapsed}
                    onKeyDown={onEnter(toggleCollapsed)}
                    role="button"
                    tabIndex={1}
                  >
                    &#9634;
                  </div>
                )}
                {modal?.canClose && (
                  <div
                    onClick={onClose}
                    onKeyDown={onEnter(onClose)}
                    role="button"
                    tabIndex={2}
                  >
                    X
                  </div>
                )}
              </div>
              {!modalsStore.collapsed
                ? (
                  <>
                    { typeof modal.content === 'function'
                      ? modal.content()
                      : modal.content }
                    {modal?.canClose && (
                      <Button
                        className={styles.bottomCloseButton}
                        onClick={onClose}
                      >
                        Закрыть
                      </Button>
                    )}
                  </>
                )
                : null}
            </div>
          </motion.div>
        )
        : null}
    </AnimatePresence>
  );
});
