import './App.css';
import 'uikit/dist/css/uikit.min.css';
import { useEffect, useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FlashCardData, LS, getInitialState } from './store/LS.ts';
import { extractFromWordList, loadFromWordJson, getShuffledArray } from './store/WordListUtils.ts';
import { HomeScreen } from './HomeScreen.tsx';
import { StudyScreen } from './StudyScreen/StudyScreen.tsx';
import { ResultScreen } from './ResultScreen.tsx';
import { createQuiz4 } from './StudyScreen/CreateQuiz.ts';
import { LearningSession } from './models/LearningSession.ts';
import { updateWordStatuses } from './models/WordStatusUtils.ts';
import { WordStatus } from './models/WordStatus.ts';
import { WordSetIndexUtil } from './models/WordSetIndex.ts';
import { Series } from './models/WordSetIndex.ts';
import { Word } from './models/Word.ts';
import { Quiz, UserAnswer } from  './models/Quiz.ts';
import React from 'react';
import { StudySet } from './StudySet.ts';
import { StudyResult } from './StudyResult.ts';

const App: React.FC = () => {
  // 現在表示している画面: 'home' or 'study' or 'result' or 'loading'
  const [currentScreen, setCurrentScreen] = useState('loading');
  
  // LocalStorage上のデータ
  const [storageData, setStorageData] = useState<FlashCardData>(getInitialState);

  // 学習シリーズの一覧
  const [seriesSet, setSeriesSet] = useState<Series[]>([]);

  // 学習セットの状況
  const [studySet, setStudySet] = useState<StudySet>({
    words: [],
    quizzes: [],
    studyMode: 'normal',
  });

  // 現在の単語セットで扱っている単語の一覧の中で、まだ出題されていない単語の一覧
  const [remaining, setRemaining] = useState<Word[]>([]);
  
  // 学習画面の終了状況
  const [studyResult, setStudyResult] = useState<StudyResult>({
    userAnswers: [],
    endOfReason: 'finish',
  });

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

    // LocalStorageからデータの読み込み
    const data = LS.loadOrDefault();
    setStorageData(data);

  }, []);

  // クイズ終了時処理
  const onEndQuiz = (ua: UserAnswer[]) => {
    // 1問も解いていない場合には保存せず、ホーム画面に戻る
    if (ua.length === 0) {
      setCurrentScreen('home');
      return;
    }
    
    // 「やめる」を選んでいた場合には ua.length < quizzes.length となる
    // どのケースにも対応するため、studySet, quizzesはuaの長さに切り詰める
    let endOfReason: 'quit' | 'finish' = ua.length < studySet.quizzes.length ? 'quit' : 'finish';

    const studySetInner = studySet.words.slice(0, ua.length);
    const quizzesInner = studySet.quizzes.slice(0, ua.length);

    const updatedWordsStatuses = updateWordStatuses(studySet.words, quizzesInner, ua, storageData);
    setStudySet(old => ({...old, quizzes: quizzesInner}));
    setStudyResult(old => ({...old, userAnswers: ua, endOfReason: endOfReason}));
    // setStudySet(studySetInner); // StudySetはそのセットで出題される可能性のあるすべての語。次の20語に進むまで変更しない

    const saved = save(studySetInner, quizzesInner, ua, storageData, updatedWordsStatuses);
    setStorageData(saved);

    setCurrentScreen('result');
  };

  // ユーザーが画面上のボタンを押したときの処理(ここで扱うボタンは画面を横断する物に限る)
  const onUserButtonClick = (buttonName: string) => {
    switch(buttonName) {
      case 'next':
        const extracted = extractFromWordList(
          remaining,
          20,
          storageData.wordStatus
        );
        setStudySet(prev => ({
          ...prev,
          words: extracted,
          quizzes: extracted.map(createQuiz4),
          studyMode: 'normal',
        }));
        setRemaining(remaining.filter(w => !extracted.includes(w)));
        setCurrentScreen('study');
        break;
      case 'home':
        setStudySet(prev => ({
          ...prev,
          studyMode: 'normal',
        }));
        setCurrentScreen('home');
        break;
      case 'retry':
        // 間違えた問題またはチェックをつけた問題のみを再度出題する
        // retryTarget: 間違えた問題またはチェックをつけた問題のindexの一覧
        const retryTarget = studySet.quizzes.reduce((acc, quiz, index) => {
          if (quiz.answerIndex !== studyResult.userAnswers[index].option || studyResult.userAnswers[index].checked) {
            acc.push(index);
          }
          return acc;
        }, [] as number[]);
        const retryWords = getShuffledArray(retryTarget.map(index => studySet.words[index]));
        setStudySet(prev => ({
          ...prev,
          // words: retryWords, // wordsはそのセットで出題される可能性のあるすべての語。次の20語に進むまで変更しない
          quizzes: retryWords.map(createQuiz4),
          studyMode: 'retry',
        }));
        // setRemaining // そのまま
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
  const onSelectedWordSet = (filePath: string) => {
    // 単語データの読み込み
    loadFromWordJson(filePath)
      .then(wordList => {
        const wl = extractFromWordList(wordList, 20, storageData.wordStatus);
        setStudySet(prev => ({
          ...prev,
          words: wl,
          quizzes: wl.map(createQuiz4),
          studyMode: 'normal',
        }));
        setRemaining(wordList.filter(w => !wl.includes(w)));
        setCurrentScreen('study');
      }).catch(console.error);
  };

  return (
    <div>
      {
        currentScreen === 'study' ? (
          <StudyScreen quizzes={studySet.quizzes} onEndQuiz={onEndQuiz} studyMode={studySet.studyMode}/>
        ) : currentScreen === 'result' ? (
          <ResultScreen
            words={studySet.words}
            quizzes={studySet.quizzes}
            userAnswers={studyResult.userAnswers}
            wordStatus={storageData.wordStatus}
            countOfNext={countOfNext}
            reason={studyResult.endOfReason}
            studyMode={studySet.studyMode}
            onUserButtonClick={onUserButtonClick}
          />
          ) : currentScreen === 'home' ? (
            <HomeScreen seriesSet={seriesSet} wordSetStatus={storageData.wordSetStatus} onSelectedWordSet={onSelectedWordSet}/>
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
 * @param wordList 出題された単語の一覧
 * @param quizzes 出題された問題の一覧。wordListと順番が同じである
 * @param userAnswers ユーザーの回答の一覧。quizzesと順番が同じ。optionは回答選択肢で0から始まり、-1はスキップ。checkedはチェックボックスの状態。
 * @param oldFlashCardData LSから読み込んだ、既存の学習セッションデータ
 * - delete-insert方式のため、古いデータも必要となる
 * @param updatedWordsStatuses 更新後の単語の学習状況の一覧
 * - updateWordStatusesで作成したものをわたすこと
 * - updateWordStatuses関数の結果は他の箇所でも使いたかったため関数は分離した
 * @returns 保存後のデータ
 */
function save(
  wordList: Word[],
  quizzes: Quiz[],
  userAnswers: UserAnswer[],
  oldFlashCardData: FlashCardData,
  updatedWordsStatuses: WordStatus[]
): FlashCardData {
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
  const saveTarget = {
    learningSession: learningSessionClone,
      wordStatus: wordStatusClone,
        wordSetStatus: wordSetStatusClone,
  };
  LS.save(saveTarget);
  return saveTarget;
}

export default App;
