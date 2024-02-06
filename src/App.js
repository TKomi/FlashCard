import './App.css';
import 'uikit/dist/css/uikit.min.css';
import { useEffect, useState, useMemo } from 'react';
import StudyScreen from './StudyScreen/StudyScreen';
import ResultScreen from './ResultScreen';
import { createQuiz4 } from './StudyScreen/CreateQuiz';
import { LearningSession } from './models/LearningSession';
import { v4 as uuidv4 } from 'uuid';
import { WordStatus } from './models/WordStatus';
import { LS } from './store/LS';
import { extractFromWordList, loadFromWordJson } from './store/WordListUtils';

function App() {
  // 現在表示している画面: 'study' or 'result'
  const [currentScreen, setCurrentScreen] = useState('study');
  
  // LocalStorage上のデータ
  const [storageData, setStorageData] = useState({});

  // 現在の学習セットで扱っている単語の一覧
  const [studySet, setStudySet] = useState([]);

  // 現在の学習セットで扱っているクイズの一覧
  const [quizzes, setQuizzes] = useState([]);

  // 現在の単語セットで扱っている単語の一覧の中で、まだ出題されていない単語の一覧
  const [remaining, setRemaining] = useState([]);

  // ユーザーの回答の一覧
  const [userAnswers, setUserAnswers] = useState([]);

  // クイズの一覧の順番に対応する、単語の学習状況の一覧(更新後)
  const [wordStatus, setWordStatus] = useState([]);

  // 次のn個へ進むボタンの表示に使用する、次のセッションで学習する単語の数
  const countOfNext = useMemo(() => remaining.length <= 20 ? remaining.length : 20, [remaining]);

  // 起動時処理
  useEffect(() => {
    // LocalStorageからデータの読み込み
    const data = LS.loadOrDefault();
    setStorageData(data);

    // 単語データの読み込み
    loadFromWordJson('./data/toeic_service_list.json')
      .then(wordList => {
        const wl = extractFromWordList(wordList, 20, data.wordStatus);
        setStudySet(wl);
        setQuizzes(wl.map(createQuiz4));
        setRemaining(wordList.filter(w => !wl.includes(w)));
      }).catch(console.error);
  }, []);

  // クイズ終了時処理
  const onEndQuiz = (ua) => {
    // studySet, quizzes, userAnswersの内容を追記
    setUserAnswers(ua);
    const updatedWordsStatuses = updateWordStatuses(studySet, quizzes, ua, storageData);
    setWordStatus(updatedWordsStatuses);
    save(studySet, quizzes, ua, storageData, updatedWordsStatuses);
    setCurrentScreen('result');
  };

  // ユーザーが画面上のボタンを押したときの処理
  const onUserButtonClick = (buttonName) => {
    switch(buttonName) {
      case 'next':
        const extracted = extractFromWordList(remaining, 20, wordStatus);
        setStudySet(extracted);
        setQuizzes(extracted.map(createQuiz4));
        setRemaining(remaining.filter(w => !extracted.includes(w)));
        setCurrentScreen('study');
        break;
      default: 
        break;
    }
  };

  return (
    <div>
      {
        currentScreen === 'study' ? (
          <StudyScreen quizzes={quizzes} onEndQuiz={onEndQuiz} />
        ) : currentScreen === 'result' ? (
          <ResultScreen
            words={studySet}
            quizzes={quizzes}
            userAnswers={userAnswers}
            wordStatus={wordStatus}
            countOfNext={countOfNext}
            onUserButtonClick={onUserButtonClick}
          />
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
 * 学習セット1件の終了後の各単語の学習状況(単語ステータス)を取得する
 * 
 * @param {Word[]} studySet 単語の一覧
 * @param {Quiz[]} quizzes クイズの一覧
 * - 順番は単語の一覧と同じ
 * @param {number[]} userAnswers ユーザーの回答の一覧
 * - 順番は単語の一覧と同じ
 * @param {import("./store/LS").FlashCardData} saveData LSから読み込んだ、既存のデータ
 * @returns {WordStatus[]} 単語の学習状況の一覧
 * - 単語(クイズ, 回答)の一覧と同じ順番で、各単語の学習状況を格納した配列
 */
function updateWordStatuses(studySet, quizzes, userAnswers, saveData) {
  const result = [];

  for (const word of studySet) {
    // 対応するwordStatusを取得, なければ新規作成
    const updated = saveData.wordStatus[word.word] || new WordStatus(word.word, new Date().toISOString(), [], 0);

    // dateを更新
    updated.lastLearnedDate = new Date().toISOString();

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

export default App;
