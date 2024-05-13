import type { FC } from 'react';

import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'framer-motion';
import classNames from 'classnames';

import { store } from 'Store';
import { onEnter } from 'Helpers';

import styles from './TowerCthulhu.module.css';

const towerImg = require('../../imgs/tower_c_back.png');

interface TProps {
  className?: string;
}

export const TowerCthulhu: FC<TProps> = observer(({
  className,
}) => {
  const { previewStore } = store;
  const onClick = useCallback(() => {
    const componentToShow = (
      <img
        alt="Р'льех"
        className={classNames(
          styles.container,
          styles.big,
          className,
        )}
        draggable="false"
        src={towerImg}
      />
    );
    previewStore.show(componentToShow);
  }, [className, previewStore]);

  return (
    <motion.img
      alt="Р'льех"
      className={classNames(
        styles.container,
        className,
        styles.clickable,
      )}
      layoutId="towerCthulhu"
      onClick={onClick}
      onKeyDown={onEnter(onClick)}
      role="button"
      src={towerImg}
      tabIndex={0}
    />
  );
});
