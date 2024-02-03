import React, { useEffect, useState, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { Word } from '../models/Word';
import { createQuiz4 } from './CreateQuiz';
import OptionButtons from './OptionButtons';

/**
 * wordSetに入っている単語を、ランダムな順番でクイズとして表示する画面コンポーネント
 * 
 * このコンポーネントの責務
 * - 単語セットを受け取って、その順番に表示する
 * - 単語に含まれる解答および選択肢を使ってクイズを作る。つまり選択肢をランダムに並び替える
 * - ユーザーの回答を受け取って、正解かどうかを判定し表示、次の問題に進む
 * - 終了時にユーザーの回答を親コンポーネントに通知する
 * 
 * このコンポーネントでやらないこと
 * - 単語セットに入っているものは全て表示する。つまり、一部のみを抜き出すということはやらない
 * 
 * @param {{wordSet: Word[], onEndQuiz: () => void}} wordSet 画面で扱う単語セット
 */
function StudyScreen({ wordSet, onEndQuiz }) {
  // ステート
  // クイズの一覧: Quiz[]
  const [quizzes, setQuizzes] = useState([]);

  // 現在の問題番号: number (0から始まる)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // ユーザーの回答: number[] Quizのインデックスに対応する選択肢のインデックス。0から始まる。-1は「スキップ」
  const [userAnswers, setUserAnswers] = useState([]);

  // メモ化
  // 現在の問題: Quiz
  const currentQuiz = useMemo(() => quizzes[currentQuestionIndex], [quizzes, currentQuestionIndex]);


  // 起動時処理
  useEffect(() => {
    setQuizzes(wordSet.map(createQuiz4));
  }, [wordSet]);

  // 次の問題
  useEffect(() => {
    if (currentQuestionIndex >= quizzes.length) {
      // クイズが終わった
      console.log('クイズ終了');
    }
  }, [currentQuestionIndex, quizzes.length]);

  /**
   * ユーザーの回答を受け取った時の処理
   * 
   * - 回答を記録する
   * - 次の問題があれば、次の問題に進む
   * @param {number} userAnswer ユーザーの解答。Quizのインデックスに対応する選択肢のインデックス。0から始まる。-1は「スキップ」
   */
  const recordAndNextQuiz = (userAnswer) => {
    setUserAnswers([...userAnswers, userAnswer]);
    if (currentQuestionIndex + 1 < quizzes.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      if (onEndQuiz) {
        onEndQuiz(userAnswers);
      }
      console.log('クイズ終了');
    }
  };

  return (
    <div>
      {
        quizzes.length > 0 && currentQuestionIndex < quizzes.length &&
        <div>
          <p>通常学習 {currentQuestionIndex + 1} / {quizzes.length} Words</p>
          <p>{currentQuiz.question}</p>
          <OptionButtons quiz={currentQuiz} onAnswer={() => {}} onNextQuiz={recordAndNextQuiz} />
        </div>
      }
    </div>
  );
}



export default StudyScreen;