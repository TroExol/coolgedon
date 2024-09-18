import type { FC } from 'react';
import type { TVariant } from '@coolgedon/shared';

import React from 'react';
import { observer } from 'mobx-react-lite';

import stylesModal from 'Component/Modal/Modal.module.css';
import { Button } from 'Component/Button';

import styles from './SelectVariantModal.module.css';

interface TProps {
  list: TVariant[],
  onConfirm: (data: TVariant) => void,
  title?: string,
}

export const SelectVariantModal: FC<TProps> = observer(({
  title,
  list,
  onConfirm,
}) => (
  <div>
    {title && (<h3 className={stylesModal.title}>{title}</h3>)}
    <div className={styles.container}>
      {list.map(({ id, value }) => (
        <Button
          key={id}
          onClick={() => onConfirm({ id, value })}
        >
          {value}
        </Button>
      ))}
    </div>
  </div>
));
