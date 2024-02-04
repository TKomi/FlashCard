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
 * @param {{words: Word[], quizzes: Quiz[], userAnswers: number[], wordStatus: import("./models/WordStatus").WordStatus}} props 画面で扱う単語リスト、クイズの一覧、ユーザーの回答、各単語の学習状況
 */
function ResultScreen({ words, quizzes, userAnswers, wordStatus }) {

  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const newEntries = quizzes.map((quiz, index) => {
      const word = words[index];
      const spelling = word.word;
      const correctAnswer = word.quiz.answer; // string
      const isCorrect = quiz.answerIndex === userAnswers[index];
      const status = wordStatus[index].status;
      return { index, spelling, correctAnswer, isCorrect, status };
    });
    setEntries(newEntries);
  }, [words, quizzes, userAnswers, wordStatus]);

  return (
    <div>
      <ul>
        {entries.map(entry => (
          <li key={entry.index} className="result-row">
            <div className="result-index">{entry.index + 1}.</div>
            <div className="result-spelling">{entry.spelling}</div>
            <div className="result-answer">{entry.correctAnswer}</div>
            <div className="result-isCorrect">{entry.isCorrect ? '○' : '×'}</div>
            <ResultStatus wordStatus={entry.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 「覚えた」「うろ覚え」などの学習状況を表示するコンポーネント
 * @param {{wordStatus: 0|1|2|3}}
 * @returns JSX.Element
 */
function ResultStatus({ wordStatus }) {
  switch(wordStatus) {
    case 3:
      return (<div className="result-status-3">覚えた</div>);
    case 2:
      return (<div className="result-status-2">うろ覚え</div>);
    case 1:
      return (<div className="result-status-1">苦手</div>);
    case 0:
    default:
      return (<div className="result-status-0">未学習</div>);
  }
}

export default ResultScreen;