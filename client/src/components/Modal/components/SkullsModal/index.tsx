import type { FC } from 'react';
import type { TSkull } from '@coolgedon/shared';

import React from 'react';
import { observer } from 'mobx-react-lite';

import { Skull } from 'Component/Skull';
import stylesModal from 'Component/Modal/Modal.module.css';

import styles from './SkullsModal.module.css';

interface TProps {
  skulls: TSkull[];
  title?: string;
}

export const SkullsModal: FC<TProps> = observer(({
  skulls,
  title,
}) => (
  <div>
    {title && (<h3 className={stylesModal.title}>{title}</h3>)}
    <div className={styles.container}>
      {skulls.map(skull => (
        <Skull
          big
          key={skull.id}
          skull={skull}
        />
      ))}
    </div>
  </div>
));
