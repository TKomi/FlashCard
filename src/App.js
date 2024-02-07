import './App.css';
import 'uikit/dist/css/uikit.min.css';
import { useEffect, useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { LS } from './store/LS';
import { extractFromWordList, loadFromWordJson } from './store/WordListUtils';
import HomeScreen from './HomeScreen';
import StudyScreen from './StudyScreen/StudyScreen';
import ResultScreen from './ResultScreen';
import { createQuiz4 } from './StudyScreen/CreateQuiz';
import { LearningSession } from './models/LearningSession';
import { updateWordStatuses } from './models/WordStatusUtils';
import { WordSetIndex } from './models/WordSetIndex';

function App() {
  // 現在表示している画面: 'home' or 'study' or 'result' or 'loading'
  const [currentScreen, setCurrentScreen] = useState('loading');
  
  // LocalStorage上のデータ
  const [storageData, setStorageData] = useState({});

  // 学習シリーズの一覧
  const [seriesSet, setSeriesSet] = useState([]);

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
    // -> HomeScreenに戻ってきた時の処理で読み込む
    setCurrentScreen('home');
  
    // 学習シリーズの一覧の読み込み
    WordSetIndex.loadFromIndexJson('./data/index.json')
    .then(seriesSet => {
      setSeriesSet(seriesSet);
    }).catch(console.error);

  }, []);

  // HomeScreenに戻ってきた時の処理(初回含む)
  useEffect(() => {
    if (currentScreen === 'home') {
      // LocalStorageからデータの読み込み
      const data = LS.loadOrDefault();
      setStorageData(data);
    }
  }, [currentScreen]);

  // クイズ終了時処理
  const onEndQuiz = (ua) => {
    // studySet, quizzes, userAnswersの内容を追記
    setUserAnswers(ua);
    const updatedWordsStatuses = updateWordStatuses(studySet, quizzes, ua, storageData);
    setWordStatus(updatedWordsStatuses);
    save(studySet, quizzes, ua, storageData, updatedWordsStatuses);
    setCurrentScreen('result');
  };

  // ユーザーが画面上のボタンを押したときの処理(ここで扱うボタンは画面を横断する物に限る)
  const onUserButtonClick = (buttonName) => {
    switch(buttonName) {
      case 'next':
        const extracted = extractFromWordList(remaining, 20, wordStatus);
        setStudySet(extracted);
        setQuizzes(extracted.map(createQuiz4));
        setRemaining(remaining.filter(w => !extracted.includes(w)));
        setCurrentScreen('study');
        break;
      case 'home':
        setCurrentScreen('home');
        break;
      default: 
        break;
    }
  };

/* HomeScreenで単語セットが選択されたときの処理
 * - 受け取った単語セットのファイルパスに該当する単語データを読み込む
 * - その単語データを元に、学習セット、クイズ、残りの単語を設定する。最後に、学習画面に遷移する
 */
  const onSelectedWordSet = (filePath) => {
    // 単語データの読み込み
    loadFromWordJson(filePath)
      .then(wordList => {
        const wl = extractFromWordList(wordList, 20, storageData.wordStatus);
        setStudySet(wl);
        setQuizzes(wl.map(createQuiz4));
        setRemaining(wordList.filter(w => !wl.includes(w)));
        setCurrentScreen('study');
      }).catch(console.error);
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
          ) : currentScreen === 'home' ? (
            <HomeScreen seriesSet={seriesSet} wordSetStatus={storageData.learningInfo} onSelectedWordSet={onSelectedWordSet}/>
          ) : (
          <div>
            <p>Loading...</p>
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
 * @param {{option: number, checked: boolean}[]} userAnswers ユーザーの回答の一覧。quizzesと順番が同じ。optionは回答選択肢で0から始まり、-1はスキップ。checkedはチェックボックスの状態。
 * @param {import('./store/LS').FlashCardData} oldFlashCardData LSから読み込んだ、既存の学習セッションデータ
 * - delete-insert方式のため、古いデータも必要となる
 * @param {WordStatus[]} updatedWordsStatuses 更新後の単語の学習状況の一覧
 * - updateWordStatusesで作成したものをわたすこと
 * - updateWordStatuses関数の結果は他の箇所でも使いたかったため関数は分離した
 */
function save(wordList, quizzes, userAnswers, oldFlashCardData, updatedWordsStatuses) {
// 学習セッションの状況
  const learningSessionClone = [...oldFlashCardData.learningSession];
  learningSessionClone.push(new LearningSession({
    sessionId: uuidv4(),
    wordSetNo: 1, // 仮実装
    completionDate: new Date().toISOString(),
    answerHistory: userAnswers.map((answer, index) => {
      return {
        w: wordList[index].word,
        c: quizzes[index].answerIndex === answer.option,
      };
    }),
  }));

  // updatedWordStatusesを詰め直す
  const wordStatusClone = { ...oldFlashCardData.wordStatus };
  for(const st of updatedWordsStatuses){
    wordStatusClone[st.word] = st;
  }

  // WordSetStatus更新処理
  const wordSetStatusClone = [ ...oldFlashCardData.wordSetStatus];
  {
    let target = wordSetStatusClone.find(wss => wss.wordSetNo === 1);
    if(!target){
      target = target || {
          wordSetNo: 1, // 仮実装
          groupsAndCounts: {
              group0: 0,
              group1: 0,
              group2: 0,
              group3: 0,
          },
          learningCount: 0,
      }; // 初期化
      wordSetStatusClone.push(target);
  } 
    const group0 = updatedWordsStatuses.filter(st => st.status === 0).length;
    const group1 = updatedWordsStatuses.filter(st => st.status === 1 || st.status === 2).length;
    const group2 = updatedWordsStatuses.filter(st => st.status === 3 || st.status === 4).length;
    const group3 = updatedWordsStatuses.filter(st => st.status === 5 || st.status === 6).length;
    target.groupsAndCounts = {
        group0: target.groupsAndCounts.group0 + group0,
        group1: target.groupsAndCounts.group1 + group1,
        group2: target.groupsAndCounts.group2 + group2,
        group3: target.groupsAndCounts.group3 + group3,
    };
    target.learningCount = target.learningCount + 1;
  }

  // LocalStorageに保存する
  LS.save({
    learningSession: learningSessionClone,
    wordStatus: wordStatusClone,
    wordSetStatus: wordSetStatusClone,
  });
}

export default App;
