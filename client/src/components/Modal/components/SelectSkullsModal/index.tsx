import type { FC } from 'react';
import type { TSkull } from '@coolgedon/shared';

import React from 'react';
import { observer } from 'mobx-react-lite';

import { Skull } from 'Component/Skull';
import stylesModal from 'Component/Modal/Modal.module.css';

import styles from './SelectSkullsModal.module.css';

interface TProps {
  skulls: TSkull[];
  title?: string;
  selectedSkulls: TSkull[];
  count?: number;
  onClick?: (skull: TSkull) => void;
}

export const SelectSkullsModal: FC<TProps> = observer(({
  skulls,
  selectedSkulls,
  title,
  count,
  onClick,
}) => {
  const bordered = (skull: TSkull) => selectedSkulls.includes(skull);

  return (
    <div>
      {title && (<h3 className={stylesModal.title}>{title}</h3>)}
      <div className={styles.container}>
        {skulls.map(skull => (
          <Skull
            big
            bordered={bordered(skull)}
            key={skull.id}
            onClick={onClick && count !== 0 ? () => onClick(skull) : undefined}
            skull={skull}
          />
        ))}
      </div>
    </div>
  );
});
