// eslint-disable-next-line no-unused-vars
import { Quiz } from '../models/Quiz.ts';
import React, { useEffect, useState } from 'react';
import styles from './OptionButtons.module.scss';

export type Props = {
  /**
   * 表示するクイズ
   */
  quiz: Quiz,

  /**
   *  ユーザーが回答した後の処理。
   * @param userAnswer ユーザーの回答。optionは回答選択肢で0から始まり、-1はスキップ。checkedはチェックボックスの状態。
   */
  onAnswer?: (_userAnswer: { option: number, checked: boolean }) => void,

  /**
   * 次の問題に進む直前に呼び出される処理。
   * @param userAnswer ユーザーの回答。optionは回答選択肢で0から始まり、-1はスキップ。checkedはチェックボックスの状態。
   */
  onNextQuiz: (_userAnswer: {option: number, checked: boolean}) => void,

  /**
   * やめるボタンが押された時の処理
   */
  onQuit: () => void
}

/**
 * クイズ1問の選択肢ボタンユニット
 * 
 * @description
 * 【このコンポーネントの責務】
 * - 選択肢がクリックされたら正誤判定して表示し、onAnswerを呼び出す
 *   - 正誤表示する時間は1秒とする
 *   - この間すべての選択肢ボタンはロックされ、クリックできない状態にする
 * - 正誤表示が終わったらonNextQuizを呼び出す
 * - やめるボタンが押されたらonQuitを呼び出す
 * 
 * @param props
 * @returns OptionButtonsコンポーネント
 * @author TKomi
 */
export const OptionButtons: React.FC<Props> = ({quiz, onAnswer, onNextQuiz, onQuit}) => {
  // ロック状態 デフォルトはfalse(ロックされていない)
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // チェックボックスの状態 デフォルトはfalse(未チェック)
  const [checked, setChecked] = useState<boolean>(false);

  // 回答ボタンのスタイル(クラス)
  // スタイルの選択肢はdefault(未回答), correct(正解), incorrect(不正解), actual(本当の正解)
  const [buttonStyle, setButtonStyle] = useState<string[]>([styles.default, styles.default, styles.default, styles.default]);

  // スキップボタンのスタイル(クラス)
  // スタイルの選択肢はdefault(未回答), incorrect(不正解)
  const [skipButtonStyle, setSkipButtonStyle] = useState<string>(styles.default);

  useEffect(() => {
    // スタイルの初期化
    setButtonStyle([styles.default, styles.default, styles.default, styles.default]);
    setSkipButtonStyle(styles.default);

    // チェックボックスはクリア
    setChecked(false);
  }, [quiz])

  // ユーザーが回答した後の処理
  const onAnswerInner = (userAnswer: number) => {
    // 1. ボタンをロックする
    setIsLocked(true);
    if (onAnswer) {
      onAnswer({option: userAnswer, checked: checked});
    }

    // 2.ユーザーの回答にあわせてスタイルを変更する
    // 正誤判定時のスタイル
    const nextStyle = [styles.default, styles.default, styles.default, styles.default];
    let nextSkipStyle = styles.default;

    // 正誤判定し、スタイルを変更する
    if(quiz.answerIndex === userAnswer){
      // 正解の場合。
      // 選んでおらず、不正解: defaultのまま
      // 選んでおり、正解
      nextStyle[userAnswer] = styles.correct;
    } else if (userAnswer === -1) {
      // スキップした場合。
      // 選んでいない選択肢: defaultのまま
      // スキップボタン: 不正解
      nextSkipStyle = styles.incorrect;
      // 選んでおらず、正解
      nextStyle[quiz.answerIndex] = styles.actual;
    } else {
      // スキップ以外の不正解の場合。
      // 選んでおらず、不正解: defaultのまま
      // 選んでおらず、正解
      nextStyle[quiz.answerIndex] = styles.actual;
      // 選んでおり、不正解
      nextStyle[userAnswer] = styles.incorrect;
    }
    setButtonStyle(nextStyle);
    setSkipButtonStyle(nextSkipStyle);

    // 3. 1秒後にロックを解除し、次の問題に進む
    setTimeout(() => {
      setIsLocked(false);
      if (onNextQuiz){
        onNextQuiz({option: userAnswer, checked: checked});
      }
    }, 1000);
  
  }

  return (
    <div className={styles['optionButtons']}>
      <div className="uk-flex uk-flex-center uk-flex-column uk-width-1-1" >
        {quiz.options.map((option, index) => (
          <button key={index} onClick={() => onAnswerInner(index)} disabled={isLocked} className={`uk-width-4-5 ${styles['optionButton']} ${buttonStyle[index]}`}>{option}</button>
        ))}
        <div className = 'uk-flex uk-width-1-1 uk-margin-top' >
          <div className = 'uk-width-1-2' >
            <label className={styles['checkbox']} > <input type = "checkbox"
            className = "uk-checkbox" checked={checked} onChange={() => setChecked(!checked)} /> チェック </label>
          </div>
          <div className='uk-width-1-2'>
            <button onClick = {
              () => onAnswerInner(-1)
            }
            disabled = {
              isLocked
            }
            className = {
              `${styles['skipButton']} ${skipButtonStyle}`
            } > スキップ </button>
          </div>
        </div>
        <button className={styles['quitButton']} onClick={onQuit}>やめる</button>
    </div>
  </div>  
  );
}