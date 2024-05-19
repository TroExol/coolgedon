import type { FC, KeyboardEventHandler, MouseEventHandler } from 'react';
import type { TProp } from '@coolgedon/shared';

import React from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';

import { onEnter } from 'Helpers';

import styles from './Prop.module.css';

interface Props {
  className?: string;
  big?: boolean;
  bordered?: boolean;
  count?: number;
  prop?: TProp;
  disabled?: boolean;
  onClick?: MouseEventHandler | KeyboardEventHandler;
}

export const Prop: FC<Props> = observer(({
  className,
  count,
  big,
  bordered,
  prop,
  disabled,
  onClick,
}) => {
  const propImgUrl = prop
    ? `/src/imgs/props/${prop.id}.jpg`
    : '/src/imgs/prop.jpg';

  const clickable = onClick && count !== 0;

  return (
    <div
      className={styles.container}
      title={`Свойство${count !== undefined ? ` ${count} шт.` : ''}`}
    >
      <img
        alt="Свойство"
        className={classNames(
          styles.prop,
          className,
          {
            [styles.clickable]: clickable,
            [styles.disabled]: disabled,
            [styles.bordered]: bordered,
            [styles.big]: big,
          },
        )}
        draggable="false"
        onClick={onClick as MouseEventHandler}
        onKeyDown={onEnter(onClick as KeyboardEventHandler)}
        src={propImgUrl}
        tabIndex={!disabled && clickable ? 0 : -1}
      />
      {!!count && (
        <span>{count}</span>
      )}
    </div>
  );
});
