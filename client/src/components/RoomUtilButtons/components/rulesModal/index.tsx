import type { FC } from 'react';

import React from 'react';
import { observer } from 'mobx-react-lite';

import styles from './RulesModal.module.css';

const rulesPdf = require('../../../../imgs/rules.pdf');

export const RulesModal: FC = observer(() => (
  <object
    className={styles.container}
    data={rulesPdf}
    type="application/pdf"
  >
    <p>
      <a
        href="https://hobbygames.ru/download/rules/ESW_DeckBuilding_rulebook.pdf"
      >
        Ссылка на правила
      </a>
    </p>
  </object>
));
