import type {
  FC, KeyboardEventHandler, MouseEventHandler,
} from 'react';
import type { TCard } from '@coolgedon/shared';

import React from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { ECardTypeSprites, ECardTypes } from '@coolgedon/shared';

import { onEnter } from 'Helpers';

import styles from './Card.module.css';

type TProps = {
  bordered?: boolean;
  count?: number;
  type?: TCard['type'];
  number?: TCard['number'];
  className?: string;
  title?: string;
  disabled?: boolean;
  description?: string;
  onClick?: MouseEventHandler | KeyboardEventHandler;
} &
    (
    | {mini: boolean; big?: never; }
    | {mini?: never; big: boolean; }
    | {mini?: never; big?: never; }
    );

export const Card: FC<TProps> = observer(({
  mini,
  big,
  bordered,
  type = ECardTypes.back,
  number,
  count,
  title,
  className,
  disabled,
  description,
  onClick,
}) => {
  const isSprite = type in ECardTypeSprites;

  const cardImg = ((isSprite && number) || !isSprite)
      && type
      && require(`../../imgs/cards/${isSprite ? `${type}/${number}` : type}.jpg`);

  const clickable = onClick && count !== 0;
  const classes = classNames(
    styles.card,
    className,
    {
      [styles.mini]: mini,
      [styles.big]: big,
      [styles.bordered]: bordered,
      [styles.disabled]: disabled,
      [styles.clickable]: clickable,
    },
  );

  return (
    <div>
      <div
        className={styles.wrapper}
        title={`${title || ''}${count !== undefined ? ` ${count} шт.` : ''}`}
      >
        {count !== 0
          ? (
            <img
              alt="Карта"
              className={classes}
              draggable="false"
              onClick={onClick as MouseEventHandler}
              onKeyDown={onEnter(onClick as KeyboardEventHandler)}
              src={cardImg}
              tabIndex={!disabled && clickable ? 0 : -1}
            />
          )
          : (
            <div className={classes} />
          )}
        {!!count && (
          <span>{count}</span>
        )}
      </div>
      {!!description && (
        <p className={styles.description}>{description}</p>
      )}
    </div>
  );
});
