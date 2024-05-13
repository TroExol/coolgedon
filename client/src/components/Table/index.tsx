import type { FC } from 'react';

import React from 'react';
import { observer } from 'mobx-react-lite';

import { store } from 'Store';
import { TowerCthulhu } from 'Component/TowerCthulhu';
import { Tower } from 'Component/Tower';
import { TurnButtons } from 'Component/Table/components/TurnButtons';
import { SluggishSticks } from 'Component/Table/components/SluggishSticks';
import { Skulls } from 'Component/Table/components/Skulls';
import { RemovedLawlessnesses } from 'Component/Table/components/RemovedLawlessnesses';
import { RemovedCards } from 'Component/Table/components/RemovedCards';
import { Legends } from 'Component/Table/components/Legends';
import { FleaMarket } from 'Component/Table/components/FleaMarket';
import { Deck } from 'Component/Table/components/Deck';
import { CrazyMagic } from 'Component/Table/components/CrazyMagic';
import { Control } from 'Component/Table/components/Control';

import styles from './Table.module.css';

export const Table: FC = observer(() => {
  const { roomStore } = store;

  return (
    <div className={styles.container}>
      <div className={styles.infoCards}>
        <Skulls />
        {!roomStore.playersArray.some(({ hasTower }) => hasTower) && (<Tower />)}
        {!roomStore.playersArray.some(({ hasTowerC }) => hasTowerC) && (<TowerCthulhu />)}
        <Deck />
        <SluggishSticks />
        <RemovedCards />
        <RemovedLawlessnesses />
      </div>
      <div>
        <h3 className={styles.shopTitle}>Покупка карт</h3>
        <div className={styles.shopCards}>
          <div className={styles.notFleaMarketCards}>
            <Legends />
            <CrazyMagic />
          </div>
          <FleaMarket />
        </div>
      </div>
      <Control />
      <TurnButtons />
    </div>
  );
});
