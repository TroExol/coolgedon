import type { FC } from 'react';
import type { TProp } from '@coolgedon/shared';

import React from 'react';
import { observer } from 'mobx-react-lite';

import { Prop } from 'Component/Prop';
import stylesModal from 'Component/Modal/Modal.module.css';

import styles from './PropsModal.module.css';

interface TProps {
  props: TProp[];
  title?: string;
}

export const PropsModal: FC<TProps> = observer(({
  props,
  title,
}) => (
  <div>
    {title && (<h3 className={stylesModal.title}>{title}</h3>)}
    <div className={styles.container}>
      {props.map(prop => (
        <Prop
          big
          key={prop.id}
          prop={prop}
        />
      ))}
    </div>
  </div>
));
