import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { store } from 'Store';
import { InputNicknameModal } from 'Component/Modal/components/InputNicknameModal';

import { Game } from './Game';

export const App = observer(() => {
  const { modalsStore } = store;
  useEffect(() => {
    modalsStore.show(
      <InputNicknameModal />,
      { canClose: false, canCollapse: false },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <React.StrictMode>
      <Game />
    </React.StrictMode>
  );
});
