import React from 'react';
import styles from './ResultScreen.module.scss';

type NextButtonProps = {
  countOfNext: number,
  onUserButtonClick: (_name: string) => void,
  quitted: boolean
}

/**
 * 次の○個ボタン
 * @param Props
 * @returns NextButtonコンポーネント
 */
export const NextButton: React.FC<NextButtonProps> = ({ countOfNext, onUserButtonClick, quitted }) => {
  if (countOfNext === 0 || quitted) return <div className={styles['actionButton_spacer']}></div>;
  else {
    return (
      <button onClick={() => onUserButtonClick("next")} className={styles['actionButton']}>次の{countOfNext}個</button>
    );
  }
}