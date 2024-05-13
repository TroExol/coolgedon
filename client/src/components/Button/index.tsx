import type { ButtonHTMLAttributes, FC } from 'react';
import type { MotionProps } from 'framer-motion';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'framer-motion';
import classNames from 'classnames';

import styles from './Button.module.css';

export const Button: FC<ButtonHTMLAttributes<HTMLButtonElement> & MotionProps> = observer(({
  children,
  ...props
}) => (
  <motion.button
    type="button"
    {...props}
    className={classNames(
      props.className,
      styles.button,
    )}
  >
    {children}
  </motion.button>
));
