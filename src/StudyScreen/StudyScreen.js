import React, { useEffect, useState, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { Word } from '../models/Word.ts';
import OptionButtons from './OptionButtons';

/**
 * 親コンポーネントから渡されたクイズを順番に画面に表示するコンポーネント
 * 
 * このコンポーネントの責務
 * - クイズのリストを受け取って、その順番に表示する
 * - ユーザーの回答を受け取って、正解かどうかを判定し表示、次の問題に進む
 * - 終了時にユーザーの回答を親コンポーネントに通知する
 * 
 * このコンポーネントでやらないこと
 * - 単語に含まれる解答および選択肢を使ってクイズを作る: 正しくは親コンポーネントから受け取る
 * 
 * @param {{quizzes: Quiz[], studyMode: string, onEndQuiz: (userAnswers: {option: number, checked: boolean}[]) => void}}} wordSet 画面で扱う単語セット
 * - quizzes: クイズの一覧
 * - studyMode: 学習モード。"normal"か"retry"のいずれか。「通常学習」か「復習」のラベルの制御に使用
 * - onEndQuiz: クイズが終了したときの処理。引数はユーザーの回答の一覧
 *  - option: ユーザーの回答。Quizのインデックスに対応する選択肢のインデックス。0から始まる。-1は「スキップ」
 *  - checked: チェックボックスの状態
 */
function StudyScreen({ quizzes, studyMode, onEndQuiz }) {
  // ステート
  // 現在の問題番号: number (0から始まる)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // ユーザーの回答: {option: number, checked: boolean}[] Quizのインデックスに対応する選択肢のインデックスとチェック状態。optionは0から始まる。-1は「スキップ」
  const [userAnswers, setUserAnswers] = useState([]);

  // NOTE: setUserAnswers -> setEnd -> onEndQuiz の順番に連鎖する
  // 完了フラグ: boolean
  const [end, setEnd] = useState(false);

  // メモ化
  // 現在の問題: Quiz
  const currentQuiz = useMemo(() => quizzes[currentQuestionIndex], [quizzes, currentQuestionIndex]);

  // 次の問題
  useEffect(() => {
    if (currentQuestionIndex >= quizzes.length) {
      // クイズが終わった
      console.log('クイズ終了');
    }
  }, [currentQuestionIndex, quizzes.length]);

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
   * @param {number} userAnswer ユーザーの解答。Quizのインデックスに対応する選択肢のインデックス。0から始まる。-1は「スキップ」
   */
  const recordAndNextQuiz = (userAnswer) => {
    setUserAnswers([...userAnswers, userAnswer]);
    if (currentQuestionIndex< quizzes.length - 1) {
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
    <div>
      <h1 className='study-screen-title'>TOEIC Service List - Part1</h1>
      {
        quizzes.length > 0 && currentQuestionIndex < quizzes.length &&
        <div>
          <div className='study-screen-subtitle'>{studyMode === 'retry' ? '復習 ': '通常学習 '}
            {currentQuestionIndex + 1} / {quizzes.length} Words
          </div>
          <div className='study-screen-progress'>
            <progress value={currentQuestionIndex} max={quizzes.length} className="uk-progress study-screen-progress"/>
          </div>
          <div className='study-screen-word'>{currentQuiz.question}</div>
          <OptionButtons quiz={currentQuiz} onNextQuiz={recordAndNextQuiz} onQuit={onQuitInner}/>
        </div>
      }
    </div>
  );
}

export default StudyScreen;