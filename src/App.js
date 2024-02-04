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

  // LocalStorage上のデータ
  const [storageData, setStorageData] = useState({});

  // クイズの一覧
  const [quizzes, setQuizzes] = useState([]);

  // ユーザーの回答の一覧
  const [userAnswers, setUserAnswers] = useState([]);

  // クイズの一覧の順番に対応する、単語の学習状況の一覧(更新後)
  const [wordStatus, setWordStatus] = useState([]);

  // 起動時処理
  useEffect(() => {
    // JSONファイルから単語データの読み込み
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

    // LocalStorageからデータの読み込み
    const data = LS.loadOrDefault();
    setStorageData(data);
  }, []);

  // クイズ終了時処理
  const onEndQuiz = (ua) => {
    // wordList, quizzes, userAnswersの内容を追記
    setUserAnswers(ua);
    const updatedWordsStatuses = updateWordStatuses(wordList, quizzes, ua, storageData);
    setWordStatus(updatedWordsStatuses);
    save(wordList, quizzes, ua, storageData, updatedWordsStatuses);
    setCurrentScreen('result');
  };

  return (
    <div>
      <h1>TOEIC単語帳</h1>
      {
        currentScreen === 'study' ? (
          <StudyScreen quizzes={quizzes} onEndQuiz={onEndQuiz} />
        ) : currentScreen === 'result' ? (
          <ResultScreen words={wordList} quizzes={quizzes} userAnswers={userAnswers} wordStatus={wordStatus} />
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
 * 
 * @param {Word[]} wordList 出題された単語の一覧
 * @param {Quiz[]} quizzes 出題された問題の一覧。wordListと順番が同じである
 * @param {number[]} userAnswers ユーザーの回答の一覧。quizzesと順番が同じである
 * @param {import("./models/LearningSession").LearningSession} oldLearningSession LSから読み込んだ、既存の学習セッションデータ
 * - delete-insert方式のため、古いデータも必要となる
 * @param {WordStatus[]} updatedWordsStatuses 更新後の単語の学習状況の一覧
 * - updateWordStatusesで作成したものをわたすこと
 * - updateWordStatuses関数の結果は他の箇所でも使いたかったため関数は分離した
 */
function save(wordList, quizzes, userAnswers, oldLearningSession, updatedWordsStatuses) {
// 学習セッションの状況
  const learningSessionClone = [...oldLearningSession.learningSession];
  learningSessionClone.push(new LearningSession({
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

  // updatedWordStatusesを詰め直す
  const wordStatusClone = { ...oldLearningSession.wordStatus };
  for(const st of updatedWordsStatuses){
    wordStatusClone[st.word] = st;
  }

  // LocalStorageに保存する
  LS.save({
    learningSession: learningSessionClone,
    wordStatus: wordStatusClone,
  });
}

/**
 * 学習セッション1件の終了後の各単語の学習状況(単語ステータス)を取得する
 * 
 * @param {Word[]} wordList 単語の一覧
 * @param {Quiz[]} quizzes クイズの一覧
 * - 順番は単語の一覧と同じ
 * @param {number[]} userAnswers ユーザーの回答の一覧
 * - 順番は単語の一覧と同じ
 * @param {import("./store/LS").FlashCardData} saveData LSから読み込んだ、既存のデータ
 * @returns {WordStatus[]} 単語の学習状況の一覧
 * - 単語(クイズ, 回答)の一覧と同じ順番で、各単語の学習状況を格納した配列
 */
function updateWordStatuses(wordList, quizzes, userAnswers, saveData) {
  const result = [];

  for (const word of wordList) {
    // 対応するwordStatusを取得, なければ新規作成
    const updated = saveData.wordStatus[word.word] || new WordStatus(word.word, new Date().toISOString(), [], 0);

    // dateを更新
    updated.lastStudied = new Date().toISOString();

    // answerHistoryに最後の問題の正誤を追加
    const quizCorrectness = getQuizCorrectness(word.word, quizzes, userAnswers);
    updated.answerHistory.push(quizCorrectness);

    // statusを更新
    updated.status = getUpdatedStatus(updated.status, quizCorrectness);

    // wordStatusを更新
    result.push(updated);
  }

  return result;
}

/** クイズの一覧およびユーザーの回答の一覧を提供し、指定した単語に関するクイズ1問の正誤を取得する
 * 
 * @param {string} word 単語
 * @param {Quiz[]} quizzes クイズの一覧
 * @param {number[]} userAnswers ユーザーの回答の一覧
 * @returns {boolean} 正解ならtrue, 不正解ならfalse
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
 * @returns {0|1|2|3} 更新後のステータス
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
 * @param {any[]} array シャッフル対象の配列 副作用はありません。
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
