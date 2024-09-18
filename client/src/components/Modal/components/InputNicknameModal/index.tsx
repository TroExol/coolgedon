import type { FC, FormEvent } from 'react';

import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { services } from 'Service';

import { store } from 'Store';
import { Input } from 'Component/Input';
import { Button } from 'Component/Button';

import styles from './InputNicknameModal.module.css';

const lastNickname = localStorage.getItem('nickname');

export const InputNicknameModal: FC = observer(() => {
  const { modalsStore } = store;

  const [nickname, setNickname] = useState(lastNickname || '');
  const [roomName, setRoomName] = useState('');

  const onSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    modalsStore.close();
    services.initRoomNamespace(roomName, nickname);
    localStorage.setItem('nickname', nickname);
  }, [modalsStore, nickname, roomName]);

  return (
    <form
      className={styles.container}
      onSubmit={onSubmit}
    >
      <Input
        onChange={({ target: { value } }) => setRoomName(value)}
        placeholder="Укажите комнату"
        type="text"
        value={roomName}
      />
      <Input
        onChange={({ target: { value } }) => setNickname(value)}
        placeholder="Укажите имя"
        type="text"
        value={nickname}
      />
      <Button
        disabled={!nickname || !roomName}
        type="submit"
      >
        Дальше
      </Button>
    </form>
  );
});
