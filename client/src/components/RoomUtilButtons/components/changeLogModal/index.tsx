import type { FC } from 'react';

import React from 'react';
import { observer } from 'mobx-react-lite';

import styles from './changeLogModal.module.css';

const changeLog = require('../../../../../../CHANGELOG.md').default;

export const ChangeLogModal: FC = observer(() => (
  <div
    className={styles.container}
    dangerouslySetInnerHTML={{ __html: changeLog }}
  />
));
