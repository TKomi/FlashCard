import './App.css';
import 'uikit/dist/css/uikit.min.css';
import { useEffect, useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { LS } from './store/LS';
import { extractFromWordList, loadFromWordJson, getShuffledArray } from './store/WordListUtils';
import HomeScreen from './HomeScreen';
import StudyScreen from './StudyScreen/StudyScreen';
import ResultScreen from './ResultScreen';
import { createQuiz4 } from './StudyScreen/CreateQuiz';
import { LearningSession } from './models/LearningSession';
import { updateWordStatuses } from './models/WordStatusUtils';
import { WordSetIndexUtil } from './models/WordSetIndex';

function App() {
  // 現在表示している画面: 'home' or 'study' or 'result' or 'loading'
  const [currentScreen, setCurrentScreen] = useState('loading');
  
  // LocalStorage上のデータ
  const [storageData, setStorageData] = useState({});

  // 学習シリーズの一覧
  const [seriesSet, setSeriesSet] = useState([]);

  // 現在の学習セットで扱っている単語の一覧
  const [studySet, setStudySet] = useState([]);

  // 学習モード: 'normal' or 'retry'
  const [studyMode, setStudyMode] = useState('normal');

  // 現在の学習セットで扱っているクイズの一覧
  const [quizzes, setQuizzes] = useState([]);

  // 現在の単語セットで扱っている単語の一覧の中で、まだ出題されていない単語の一覧
  const [remaining, setRemaining] = useState([]);

  // ユーザーの回答の一覧
  const [userAnswers, setUserAnswers] = useState([]);

  // クイズの一覧の順番に対応する、単語の学習状況の一覧(更新後)
  const [wordStatus, setWordStatus] = useState([]);

  // 終了理由
  // string: "finish" or "quit"
  const [endOfReason, setEndOfReason] = useState('finish');

  // 次のn個へ進むボタンの表示に使用する、次のセッションで学習する単語の数
  const countOfNext = useMemo(() => remaining.length <= 20 ? remaining.length : 20, [remaining]);

  // 起動時処理
  useEffect(() => {
    // LocalStorageからデータの読み込み
    // -> HomeScreenに戻ってきた時の処理で読み込む
    setCurrentScreen('home');
  
    // 学習シリーズの一覧の読み込み
    WordSetIndexUtil.loadFromIndexJson('./data/index.json')
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
    // 1問も解いていない場合には保存せず、ホーム画面に戻る
    if (ua.length === 0) {
      setCurrentScreen('home');
      return;
    }
    
    // 「やめる」を選んでいた場合には ua.length < quizzes.length となる
    // どのケースにも対応するため、studySet, quizzesはuaの長さに切り詰める
    if (ua.length < quizzes.length) {
      setEndOfReason('quit');
    } else {
      setEndOfReason('finish');
    }
    const studySetInner = studySet.slice(0, ua.length);
    const quizzesInner = quizzes.slice(0, ua.length);

    const updatedWordsStatuses = updateWordStatuses(studySet, quizzesInner, ua, storageData);
    
    setUserAnswers(ua);
    // setStudySet(studySetInner); // StudySetはそのセットで出題される可能性のあるすべての語。次の20語に進むまで変更しない
    setQuizzes(quizzesInner);
    setWordStatus(updatedWordsStatuses);
    save(studySetInner, quizzesInner, ua, storageData, updatedWordsStatuses);
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
        setStudyMode('normal')
        setCurrentScreen('study');
        break;
      case 'home':
        setStudyMode('normal'); 
        setCurrentScreen('home');
        break;
      case 'retry':
        // 間違えた問題またはチェックをつけた問題のみを再度出題する
        // retryTarget: 間違えた問題またはチェックをつけた問題のindexの一覧
        const retryTarget = quizzes.reduce((acc, quiz, index) => {
          if (quiz.answerIndex !== userAnswers[index].option || userAnswers[index].checked) {
            acc.push(index);
          }
          return acc;
        }, []);
        const retryWords = getShuffledArray(retryTarget.map(index => studySet[index]));
        // setStudySet(studySetInner); // StudySetはそのセットで出題される可能性のあるすべての語。次の20語に進むまで変更しない
        setQuizzes(retryWords.map(createQuiz4));
        // setRemaining // そのまま
        setStudyMode('retry');
        setCurrentScreen('study');
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
          <StudyScreen quizzes={quizzes} onEndQuiz={onEndQuiz} studyMode={studyMode}/>
        ) : currentScreen === 'result' ? (
          <ResultScreen
            words={studySet}
            quizzes={quizzes}
            userAnswers={userAnswers}
            wordStatus={wordStatus}
            countOfNext={countOfNext}
            reason={endOfReason}
            studyMode={studyMode}
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
        // FIXME: わざわざwordListを使っているが、quizzesの方が適切では？引数も減らせるし
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
    target.groupsAndCounts = {
      group0: Object.values(wordStatusClone).filter(st => st.status === 0).length,
      group1: Object.values(wordStatusClone).filter(st => st.status === 1 || st.status === 2).length,
      group2: Object.values(wordStatusClone).filter(st => st.status === 3 || st.status === 4).length,
      group3: Object.values(wordStatusClone).filter(st => st.status === 5 || st.status === 6).length,
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
