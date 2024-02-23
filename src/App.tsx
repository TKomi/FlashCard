import 'uikit/dist/css/uikit.min.css';
import { useEffect, useState, useMemo } from 'react';
import { FlashCardData, LS, getInitialState } from './store/LS.ts';
import { extractFromWordList, loadFromWordJson, getShuffledArray } from './store/WordListUtils.ts';
import { HomeScreen } from './HomeScreen/HomeScreen.tsx';
import { StudyScreen } from './StudyScreen/StudyScreen.tsx';
import { ResultScreen } from './ResultScreen/ResultScreen.tsx';
import { createQuiz4 } from './StudyScreen/CreateQuiz.ts';
import { updateWordStatuses } from './models/WordStatusUtils.ts';
import { WordSetIndexUtil } from './models/WordSetIndex.ts';
import { Series } from './models/WordSetIndex.ts';
import { Word } from './models/Word.ts';
import { UserAnswer } from  './models/Quiz.ts';
import React from 'react';
import { StudySet } from './StudySet.ts';
import { StudyResult } from './StudyResult.ts';
import { save } from './store/SaveLearningSession.ts';

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
          <StudyScreen studySet={studySet} onEndQuiz={onEndQuiz}/>
        ) : currentScreen === 'result' ? (
          <ResultScreen
            studySet={studySet}
            wordStatus={storageData.wordStatus}
            countOfNext={countOfNext}
            studyResult={studyResult}
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

export default App;
