import React from 'react';
import styles from './ResultScreen.module.scss';

type ResultStatusProps = {
  wordStatus: 0 | 1 | 2 | 3 | 4 | 5 | 6
}

/**
 * 「覚えた」「うろ覚え」などの学習状況を表示するコンポーネント
 */
export const ResultStatus: React.FC<ResultStatusProps> = ({ wordStatus }) => {
  switch (wordStatus) {
    case 6:
    case 5:
      return (<div className={`${styles['ResultStatus']} ${styles['group-3']}`}>覚えた</div>);
    case 4:
    case 3:
      return (<div className={`${styles['ResultStatus']} ${styles['group-2']}`}>うろ覚え</div>);
    case 2:
    case 1:
      return (<div className={`${styles['ResultStatus']} ${styles['group-1']}`}>苦手</div>);
    case 0:
    default:
      return (<div className={`${styles['ResultStatus']} ${styles['group-0']}`}>未学習</div>);
  }
}
