import React, { useEffect, useState, useMemo } from 'react';
import { OptionButtons } from './OptionButtons.tsx';
import { Quiz, UserAnswer } from '../models/Quiz.ts';
import { StudySet } from '../StudySet.ts';
import styles from './StudyScreen.module.scss';

export type StudyScreenProps = {
  /**
   * 取り組んでいる学習セット
   */
  studySet: StudySet,

  /**
   * クイズが終了したときの処理
   * @param userAnswers ユーザーの回答の一覧
   */
  onEndQuiz: (_userAnswers: UserAnswer[]) => void
};

/**
 * 学習画面
 * 
 * @description
 * 【このコンポーネントの責務】
 * - 問題のリストを受け取って、その順番に表示する
 * - ユーザーの回答を受け付け、正解かどうかを判定し表示、次の問題に進む
 * - 終了時にユーザーの回答を親コンポーネントに通知する
 *   - ここで言う終了=全問題への回答、または中断
 */
export const StudyScreen: React.FC<StudyScreenProps> = ({ studySet, onEndQuiz }) => {
  // 現在の問題番号: number (0から始まる)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // ユーザーの回答: {option: number, checked: boolean}[] Quizのインデックスに対応する選択肢のインデックスとチェック状態。optionは0から始まる。-1は「スキップ」
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);

  // NOTE: setUserAnswers -> setEnd -> onEndQuiz の順番に連鎖する
  // 完了フラグ: boolean
  const [end, setEnd] = useState<boolean>(false);

  const currentQuiz = useMemo<Quiz>(() => studySet.quizzes[currentQuestionIndex], [studySet.quizzes, currentQuestionIndex]);

  // 次の問題
  useEffect(() => {
    if (currentQuestionIndex >= studySet.quizzes.length) {
      // クイズが終わった
      console.log('クイズ終了');
    }
  }, [currentQuestionIndex, studySet.quizzes.length]);

  // setUserAnswers -> setEnd でendが変化したら、onEndQuizを呼び出す
  useEffect(() => {
    if (end && onEndQuiz) {
      onEndQuiz(userAnswers);
    }
  }, [end, userAnswers, onEndQuiz]);

  /**
   * ユーザーの回答を受け取った時の処理
   * 
   * - 回答を記録する
   * - 次の問題があれば、次の問題に進む
   * @param userAnswer ユーザーの回答
   */
  const recordAndNextQuiz = (userAnswer: UserAnswer) => {
    setUserAnswers([...userAnswers, userAnswer]);
    if (currentQuestionIndex< studySet.quizzes.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setEnd(true);
    }
  };

  const onQuitInner = () => {
    setUserAnswers([...userAnswers]);
    setEnd(true);
  };

  return (
    <div className={styles['studyScreen']}>
      <h1 className={styles['title']}>TOEIC Service List - Part1</h1>
      {
        studySet.quizzes.length > 0 && currentQuestionIndex < studySet.quizzes.length &&
        <div>
          <div className={styles['subTitle']}>{studySet.studyMode === 'retry' ? '復習 ': '通常学習 '}
            {currentQuestionIndex + 1} / {studySet.quizzes.length} Words
          </div>
          <div className={styles['progress']}>
            <progress value={currentQuestionIndex} max={studySet.quizzes.length} className="uk-progress"/>
          </div>
          <div className={styles['word']}>{currentQuiz.question}</div>
          <OptionButtons quiz={currentQuiz} onNextQuiz={recordAndNextQuiz} onQuit={onQuitInner}/>
        </div>
      }
    </div>
  );
}