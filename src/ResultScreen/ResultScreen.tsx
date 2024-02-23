import React, { useEffect, useState, useMemo } from 'react';
import { WordStatus } from '../models/WordStatus.ts';
import { StudySet } from '../StudySet.ts';
import { StudyResult } from '../StudyResult.ts';
import styles from './ResultScreen.module.scss';

export type Props = {
  /**
   * 取り組んでいる学習セット
   * - words: 画面で扱った(予定も含む)単語の一覧
   * - quizzes: 出題された問題の一覧。「やめる」を選んだ以降の物は含まない。配列の順序はwordsと対応。
   * - userAnswers: ユーザーの回答の一覧。実際に回答されたもの(スキップ含む)に限る。配列の順序はquizzesと対応。
   */
  studySet: StudySet,

  /**
   * 各単語の学習状況
   */
  wordStatus: Record<string, WordStatus>,

  /**
   * 「次のn個へ進む」ボタンの表示に使用する、次のセッションで学習する単語の数
   */
  countOfNext: number,

  /**
   * 学習結果
   */
  studyResult: StudyResult,

  /**
   * ユーザーが画面上のボタンを押したときの処理。イベント引数でクリックされたボタン名を識別。
   * @param name "next": 次のn個へ進むボタンが押された
   */
  onUserButtonClick: (_name: string) => void
}

/**
 * リザルト画面の1行分のデータ
 */
type Entry = {
  index: number,
  spelling: string,
  correctAnswer: string,
  isCorrect: boolean,
  status: 0|1|2|3|4|5|6,
  isSkipped: boolean,
  isChecked: boolean,
}

/**
 * リザルト画面を表す画面コンポーネント
 * 
 * (問題番号, 問題(単語), 正解(和訳), 正誤, 学習状況) の順に、問題番号の若い順に一覧表示する
 * 
 * このコンポーネントの責務
 * - 単語および問題のリストとユーザーの回答リストを受け取り、結果を一覧表示する
 * - "次のn個へ進む"ボタンを表示する
 * 
 * このコンポーネントでやらないこと
 * - ユーザーの回答の正誤判定
 * - ユーザーの回答の記録
 * - 単語、問題のリスト、ユーザーの回答リストは受け取るだけで、自分で作成しない
 */
export const ResultScreen: React.FC<Props> = ({ studySet, wordStatus, countOfNext, studyResult, onUserButtonClick}) => {

  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const newEntries = studySet.quizzes.map((quiz, index) => {
      const word = studySet.words[index];
      const spelling = word.word;
      const correctAnswer = word.quiz.answer; // string
      const isCorrect = quiz.answerIndex === studyResult.userAnswers[index].option;
      const isChecked = studyResult.userAnswers[index].checked;
      const status = wordStatus[quiz.question]?.status;
      const isSkipped = studyResult.userAnswers[index].option === -1;
      return { index, spelling, correctAnswer, isCorrect, status, isSkipped, isChecked };
    });
    setEntries(newEntries);
  }, [studySet, studyResult.userAnswers, wordStatus]);

  const countOfCorrect = useMemo(() => entries.filter(entry => entry.isCorrect).length , [entries]);
  const countOfSkip = useMemo(() => studyResult.userAnswers.filter(answer => answer.option === -1).length, [studyResult.userAnswers]);
  const countOfIncorrect = useMemo(() => entries.length - countOfCorrect - countOfSkip , [entries, countOfCorrect, countOfSkip]);
  const countOfRetry = useMemo(() => studyResult.userAnswers.filter((answer, index) => 
    answer.checked
    || answer.option !== studySet.quizzes[index].answerIndex).length,
    [studySet.quizzes, studyResult.userAnswers]);

  return (
    <div className={styles['resultScreen']}>
      <h1 className = {styles['title']} > TOEIC Service List - Part1 </h1>
      <div className={styles['subTitle']}>{studySet.studyMode === 'retry' ? '復習 ': '通常学習 '} {entries.length}Words</div>
      <div className={styles['subTitle']}>○{countOfCorrect} / ×{countOfIncorrect} / -{countOfSkip}</div>
      <ul className={styles['list']}>
        {entries.map(entry => (
          <li key={entry.index} className={styles['item']}>
            <div className={styles['index']}>{entry.index + 1}.</div>
            <div className={styles['spelling']}>{entry.spelling}</div>
            <div className={styles['isCorrect']}>{entry.isCorrect ? '○' : entry.isSkipped ? '-' : '×'}</div>
            <div className={styles['check']}>{entry.isChecked ? '✔' : ''}</div>
            <div className={styles['answer']}>{entry.correctAnswer}</div>
            <ResultStatus wordStatus={entry.status} />
          </li>
        ))}
      </ul>
      <div className="uk-flex">
        <RetryButton countOfRetry={countOfRetry} onUserButtonClick={onUserButtonClick} />
        <button onClick={() => onUserButtonClick("home")} className={styles['actionButton']}>ホームへ戻る</button>
        <NextButton countOfNext={countOfNext} onUserButtonClick={onUserButtonClick} quitted={studyResult.endOfReason === 'quit'}/>
      </div>
    </div>
  );
}

type ResultStatusProps = {
  wordStatus: 0|1|2|3|4|5|6
}

/**
 * 「覚えた」「うろ覚え」などの学習状況を表示するコンポーネント
 */
const ResultStatus: React.FC<ResultStatusProps> = ({ wordStatus }) => {
  switch(wordStatus) {
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

type RetryButtonProps = {
  countOfRetry: number,
  onUserButtonClick: (_name: string) => void
}

const RetryButton: React.FC<RetryButtonProps> = ({countOfRetry, onUserButtonClick }) => {
  if (countOfRetry === 0) return <div className={styles['actionButton_spacer']}></div>;
  else return (
    <button onClick={() => onUserButtonClick("retry")} className={styles['actionButton_spacer']}>復習する</button>
  );
}

type NextButtonProps = {
  countOfNext: number,
  onUserButtonClick: (_name: string) => void,
  quitted: boolean
}

const NextButton: React.FC<NextButtonProps> = ({ countOfNext, onUserButtonClick, quitted }) => {
  if (countOfNext === 0 || quitted) return <div className={styles['actionButton_spacer']}></div>;
  else {
    return (
      <button onClick={() => onUserButtonClick("next")} className={styles['actionButton']}>次の{countOfNext}個</button>
    );
  }
}