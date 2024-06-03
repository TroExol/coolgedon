import type { FC } from 'react';

import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { store } from 'Store';
import { onEnter } from 'Helpers';
import { RulesModal } from 'Component/RoomUtilButtons/components/rulesModal';
import { ContactModal } from 'Component/RoomUtilButtons/components/contactModal';
import { ClearRoomModal } from 'Component/Modal/components/ClearRoomModal';
import { Button } from 'Component/Button';

import styles from './RoomUtilButtons.module.css';

export const RoomUtilButtons: FC = observer(() => {
  const [showRoomId, setShowRoomId] = useState(false);
  const { modalsStore, roomStore, previewStore } = store;

  const onShowRules = useCallback(() => {
    const componentToShow = (<RulesModal />);
    previewStore.show(componentToShow);
  }, [previewStore]);

  const onShowContact = useCallback(() => {
    const componentToShow = (<ContactModal />);
    modalsStore.show(componentToShow);
  }, [modalsStore]);

  const toggleShowRoomId = () => setShowRoomId(!showRoomId);

  const onReset = useCallback(() => {
    if (modalsStore.modals.length) {
      return;
    }
    const content = (<ClearRoomModal />);
    modalsStore.show(content);
  }, [modalsStore]);

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <Button
          onClick={onShowRules}
          onKeyDown={onEnter(onShowRules)}
        >
          Правила
        </Button>
        <Button
          onClick={onShowContact}
          onKeyDown={onEnter(onShowContact)}
        >
          Контакты
        </Button>
        <div
          className={styles.buttonRoomName}
          onClick={toggleShowRoomId}
          onKeyDown={onEnter(toggleShowRoomId)}
          role="button"
          tabIndex={0}
        >
          Комната
          {' '}
          {showRoomId ? roomStore.name : '***'}
        </div>
      </div>
      {roomStore.isAdmin(roomStore.me) && (
        <Button
          disabled={!!modalsStore.modals.length}
          onClick={onReset}
          onKeyDown={onEnter(onReset)}
        >
          Сжечь стол
        </Button>
      )}
    </div>
  );
});
