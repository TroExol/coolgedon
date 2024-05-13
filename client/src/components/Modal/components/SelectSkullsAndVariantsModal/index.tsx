import type { FC } from 'react';
import type { TSkull, TVariant } from '@coolgedon/shared';

import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';

import stylesModal from 'Component/Modal/Modal.module.css';
import { Button } from 'Component/Button';

import styles from './SelectSkullsAndVariantsModal.module.css';
import { SelectSkullsModal } from '../SelectSkullsModal';

export type TSelectSkullsProps = {
  skulls: TSkull[];
  countSkull: number;
  list: TVariant[];
  onConfirm: (data: TVariant & { selectedSkulls: TSkull[] }) => void;
  title?: string;
}

export const SelectSkullsAndVariantsModal: FC<TSelectSkullsProps> = observer(({
  skulls,
  countSkull,
  list,
  onConfirm,
  title,
}) => {
  const [selectedSkulls, setSelectedSkulls] = useState<TSkull[]>([]);

  const onSkullClick = useCallback((skull: TSkull) => {
    if (countSkull <= 0) {
      return;
    }
    if (selectedSkulls.length >= countSkull) {
      setSelectedSkulls([...selectedSkulls.slice(1), skull]);
    } else {
      setSelectedSkulls([...selectedSkulls, skull]);
    }
  }, [countSkull, selectedSkulls]);

  return (
    <div>
      {title && (<h3 className={stylesModal.title}>{title}</h3>)}
      <div className={styles.container}>
        <SelectSkullsModal
          count={countSkull}
          onClick={onSkullClick}
          selectedSkulls={selectedSkulls}
          skulls={skulls}
        />
        <div className={styles.buttons}>
          {list.map(({ id, value }) => (
            <Button
              disabled={selectedSkulls.length !== skulls.length && selectedSkulls.length !== countSkull}
              key={id}
              onClick={() => onConfirm({ id, value, selectedSkulls })}
            >
              {value}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
});
