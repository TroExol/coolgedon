import type { FC, InputHTMLAttributes } from 'react';

import React from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';

import styles from './Input.module.css';

export const Input: FC<InputHTMLAttributes<HTMLInputElement>> = observer(props => (
  <input
    {...props}
    className={classNames(
      props.className,
      styles.input,
    )}
  />
));
