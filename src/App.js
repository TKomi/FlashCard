import './App.css';
import { useEffect, useState } from 'react';
import StudyScreen from './StudyScreen/StudyScreen';
import ResultScreen from './ResultScreen';
import { Word } from './models/Word';
import { createQuiz4 } from './StudyScreen/CreateQuiz';
import { LearningSession } from './models/LearningSession';
import { v4 as uuidv4 } from 'uuid';
import { WordStatus } from './models/WordStatus';
import { LS } from './store/LS';

function App() {
  const [currentScreen, setCurrentScreen] = useState('study');

  // 以下、アプリの現在の状態(読み込んだ単語の一覧、クイズの一覧、ユーザーの回答の一覧)
  // 読み込んだ単語データの一覧
  const [wordList, setWordList] = useState([]);

  // クイズの一覧
  const [quizzes, setQuizzes] = useState([]);

  // ユーザーの回答の一覧
  const [userAnswers, setUserAnswers] = useState([]);

  // 起動時処理
  useEffect(() => {
    fetch('./data/toeic_service_list.json')
      .then(response => response.json())
      .then(getShuffledArray)
      .then(data => data.slice(0, 5)) // for debugging
      .then(data => {
        const wl = data.map(Word.fromObject);
        setWordList(wl);
        setQuizzes(wl.map(createQuiz4));
      })
      .catch(console.error);
  }, []);

  // クイズ終了時処理
  const onEndQuiz = (ua) => {
    setUserAnswers(ua);
    save(wordList, quizzes, ua);
    setCurrentScreen('result');
  };

  return (
    <div>
      <h1>TOEIC単語帳</h1>
      {
        currentScreen === 'study' ? (
          <StudyScreen quizzes={quizzes} onEndQuiz={onEndQuiz} />
        ) : currentScreen === 'result' ? (
          <ResultScreen words={wordList} quizzes={quizzes} userAnswers={userAnswers} />
        ) : (
          <div>
            <p>エラー</p>
          </div>
        )
      }
    </div>
  );
}

/**
 * 学習セッション1件の情報を保存(追記)する
 * @param {Word[]} wordList 出題された単語の一覧
 * @param {Quiz[]} quizzes 出題された問題の一覧
 * @param {number[]} userAnswers ユーザーの回答の一覧。quizzesと順番が同じである
 */
function save(wordList, quizzes, userAnswers) {
  // wordList, quizzes, userAnswersの内容を追記
  const state = {
    learningSession: [],
    wordStatus: {},
  }; // 仮実装

  // 学習セッションの状況
  state.learningSession.push(new LearningSession({
    sessionId: uuidv4(),
    wordSetId: 'sample', // 仮実装
    completionDate: new Date().toISOString(),
    answerHistory: userAnswers.map((answer, index) => {
      return {
        w: wordList[index].word,
        c: quizzes[index].answerIndex === answer,
      };
    }),
  }));

  // 単語学習状況
  for (const word of wordList) {
    // 対応するwordStatusを取得, なければ新規作成
    const updating = state.wordStatus[word.word] || new WordStatus(word.word, new Date().toISOString(), [], 0);

    // dateを更新
    updating.lastStudied = new Date().toISOString();

    // answerHistoryに最後の問題の正誤を追加
    const quizCorrectness = getQuizCorrectness(word.word, quizzes, userAnswers);
    updating.answerHistory.push(quizCorrectness);

    // statusを更新
    updating.status = getUpdatedStatus(updating.status, quizCorrectness);

    // wordStatusを更新
    state.wordStatus[word.word] = updating;
  }

  // LocalStorageに保存する
  LS.save(state);
}

/** Quizの正誤を取得
 * @param {string} word 単語
 * @param {Quiz[]} quizzes クイズの一覧
 * @param {number[]} userAnswers ユーザーの回答の一覧
 */
function getQuizCorrectness(word, quizzes, userAnswers) {
  const index = quizzes.findIndex(quiz => quiz.question === word);
  if (index !== -1) {
    return quizzes[index].answerIndex === userAnswers[index];
  }
  return false;
}

/**
 * 単語の現在の状態(未回答0、苦手1、うろ覚え2、覚えた3), 今回の回答が正解かどうか, チェックボックスの状態から、更新後のステータスを返す
 * 
 * @param {number} oldStatus 現在のステータス
 * @param {boolean} ansIsCorrect 今回の回答が正解かどうか
 * @param {boolean} checked チェックボックスの状態 // 未実装
 * @returns 更新後のステータス
 */
function getUpdatedStatus(oldStatus, ansIsCorrect, checked = false){
  // 現在の状態はcheckedが反映されていない仮のもの
  switch(oldStatus) {
    case 0:
      return ansIsCorrect ? 3 : 2;
    case 1:
      return ansIsCorrect ? 2 : 1;
    case 2:
      return ansIsCorrect ? 3 : 1;
    case 3:
      return ansIsCorrect ? 3 : 2;
    default:
      return 0;
  }
}


/**
 * 配列をシャッフルする
 * @param {*} array シャッフル対象の配列 副作用はありません。
 * @returns シャッフルされた配列
 */
function getShuffledArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default App;
