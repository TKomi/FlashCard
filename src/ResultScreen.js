import React, { useEffect, useState } from 'react';

/**
 * リザルト画面を表す画面コンポーネント
 * 
 * (問題番号, 問題(単語), 正解(和訳), 正誤) の順に、問題番号の若い順に一覧表示する
 * 
 * このコンポーネントの責務
 * - 単語および問題のリストとユーザーの回答リストを受け取り、結果を一覧表示する
 * 
 * このコンポーネントでやらないこと
 * - ユーザーの回答の正誤判定
 * - ユーザーの回答の記録
 * - 単語、問題のリスト、ユーザーの回答リストは受け取るだけで、自分で作成しない
 * 
 * @param {{words: Word[], quizzes: Quiz[], userAnswers: number[]}} props 画面で扱う単語リスト、クイズの一覧、ユーザーの回答
 */
function ResultScreen({ words, quizzes, userAnswers }) {

  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const newEntries = quizzes.map((quiz, index) => {
      const word = words[quiz.wordIndex];
      const correctAnswer = word.meaning;
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === quiz.correctAnswer;
      return { index, word, correctAnswer, userAnswer, isCorrect };
    });
    setEntries(newEntries);
  }, [words, quizzes, userAnswers]);

  return (
    <div>
      <ul>
        {entries.map(entry => (
          <li key={entry.index}>
            <div>{entry.index + 1}.</div>
            <div>{entry.word.word}</div>
            <div>{entry.correctAnswer}</div>
            <div>{entry.isCorrect ? '○' : '×'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ResultScreen;