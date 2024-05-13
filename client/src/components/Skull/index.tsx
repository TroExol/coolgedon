import type { FC, KeyboardEventHandler, MouseEventHandler } from 'react';
import type { TSkull } from '@coolgedon/shared';

import React from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';

import { onEnter } from 'Helpers';

import styles from './Skull.module.css';

const skullBackImg = require('../../imgs/skull.png');

interface TProps {
  big?: boolean;
  bordered?: boolean;
  className?: string;
  skull?: TSkull;
  count?: number;
  onClick?: MouseEventHandler | KeyboardEventHandler;
}

export const Skull: FC<TProps> = observer(({
  big,
  bordered,
  className,
  skull,
  count,
  onClick,
}) => {
  const skullImg = skull
    ? require(`../../imgs/skulls/${skull.id}.png`)
    : skullBackImg;

  const clickable = onClick && count !== 0;

  return (
    <div
      className={classNames(
        styles.container,
        {
          [styles.clickable]: clickable,
          [styles.bordered]: bordered,
        },
      )}
      onClick={onClick as MouseEventHandler}
      onKeyDown={onEnter(onClick as KeyboardEventHandler)}
      role="toolbar"
      tabIndex={clickable ? 0 : -1}
      title={`Дохлый колдун${count !== undefined ? ` ${count} шт.` : ''}`}
    >
      <img
        alt="Дох. колдун"
        className={classNames(
          styles.skull,
          className,
          {
            [styles.big]: big,
          },
        )}
        draggable="false"
        src={skullImg}
      />
      {count && (
        <span>{count}</span>
      )}
    </div>
  );
});
