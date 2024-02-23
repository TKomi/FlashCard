import styles from './ResultScreen.module.scss';
import React from 'react';

type RetryButtonProps = {
  countOfRetry: number,
  onUserButtonClick: (_name: string) => void
}

/**
 * 復習ボタン
 * @param Props
 * @returns RetryButtonコンポーネント
 */
export const RetryButton: React.FC<RetryButtonProps> = ({ countOfRetry, onUserButtonClick }) => {
  if (countOfRetry === 0) return <div className={styles['actionButton_spacer']} data-testid="spacer"></div>;
  else return (
    <button onClick={() => onUserButtonClick("retry")} className={styles['actionButton']}>復習する</button>
  );
}
