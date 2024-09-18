import type { FC } from 'react';

import React from 'react';
import { observer } from 'mobx-react-lite';

import styles from './ContactModal.module.css';

export const ContactModal: FC = observer(() => (
  <div className={styles.container}>
    <a
      href="https://github.com/TroExol/coolgedon/issues/new?labels=enhancement&template=feature-request---.md"
      rel="noreferrer"
      target="_blank"
    >
      Предложить идею на GitHub
    </a>
    <a
      href="https://github.com/TroExol/coolgedon/issues/new?labels=bug&template=bug-report---.md"
      rel="noreferrer"
      target="_blank"
    >
      Сообщить об ошибке на GitHub
    </a>
    <p>
      Написать в Telegram
      {' '}
      <a
        href="https://t.me/troexol"
        rel="noreferrer"
        target="_blank"
      >
        troexol
      </a>
    </p>
    <p>
      Написать на почту
      {' '}
      <a
        href="mailto:zeidxol@gmail.com"
        rel="noreferrer"
        target="_blank"
      >
        zeidxol@gmail.com
      </a>
    </p>
  </div>
));
