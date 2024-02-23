import 'uikit/dist/css/uikit.min.css';
import { useEffect, useState, useMemo } from 'react';
import { FlashCardData, LS, getInitialState } from './store/LS.ts';
import { extractFromWords, loadFromWordJson, getShuffledArray } from './store/WordSetUtils.ts';
import { HomeScreen } from './HomeScreen/HomeScreen.tsx';
import { StudyScreen } from './StudyScreen/StudyScreen.tsx';
import { ResultScreen } from './ResultScreen/ResultScreen.tsx';
import { createQuiz4 } from './StudyScreen/CreateQuiz.ts';
import { updateWordStatuses } from './models/WordStatusUtils.ts';
import { WordSetIndex, WordSetIndexUtil } from './models/WordSetIndex.ts';
import { Series } from './models/WordSetIndex.ts';
import { UserAnswer } from  './models/Quiz.ts';
import React from 'react';
import { StudySet } from './StudySet.ts';
import { StudyResult } from './StudyResult.ts';
import { save } from './store/SaveLearningSession.ts';

/**
 * アプリのルートコンポーネント
 * 
 * @description
 * 【このコンポーネントの責務】
 * - 学習画面、ホーム画面、結果画面の切り替え
 *   - 画面遷移のための状態管理
 *   - 各画面にコールバックを渡し、画面遷移時に呼び出してもらう
 * - アプリ起動時処理
 *   - 学習シリーズの一覧の読み込み
 * - LocalStorageの読み書き
 * - 学習セッション、学習セットの状況の管理
 * @returns Appコンポーネント
 * @author TKomi
 */
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
    remaining: [],
    index: null,
    series: null,
  });

  // // 現在の学習セッションで扱っている単語の一覧の中で、まだ出題されていない単語の一覧
  // const [remaining, setRemaining] = useState<Word[]>([]);
  
  // 学習画面の終了状況
  const [studyResult, setStudyResult] = useState<StudyResult>({
    userAnswers: [],
    endOfReason: 'finish',
  });

  // 次のn個へ進むボタンの表示に使用する、次のセッションで学習する単語の数
  const countOfNext = useMemo(() => studySet.remaining.length <= 20 ? studySet.remaining.length : 20, [studySet.remaining]);

  // 起動時処理
  useEffect(() => {
    // LocalStorageからデータの読み込み
    // -> HomeScreenに戻ってきた時の処理で読み込む
    setCurrentScreen('home');
  
    // 学習シリーズの一覧の読み込み
    WordSetIndexUtil.loadFromIndexJson('./data/index.json')
    .then(seriesSet => {
      setSeriesSet(seriesSet);
    }).catch(error => {
      console.error('Jsonファイルから単語一覧取得に失敗', error);
    });

    // LocalStorageからデータの読み込み
    const data = LS.loadOrDefault();
    setStorageData(data);

    console.info('アプリ起動処理が完了');
  }, []);

  // 問題終了時処理
  const onEndQuiz = (ua: UserAnswer[]) => {
    // 1問も解いていない場合には保存せず、ホーム画面に戻る
    if (ua.length === 0) {
      setCurrentScreen('home');
      return;
    }
    
    // 「やめる」を選んでいた場合には ua.length < quizzes.length となる
    // どのケースにも対応するため、studySet, quizzesはuaの長さに切り詰める
    let endOfReason: 'quit' | 'finish' = ua.length < studySet.quizzes.length ? 'quit' : 'finish';

    const quizzesInner = studySet.quizzes.slice(0, ua.length);

    const updatedWordsStatuses = updateWordStatuses(quizzesInner, ua, storageData);
    setStudySet(old => ({...old, quizzes: quizzesInner}));
    setStudyResult(old => ({...old, userAnswers: ua, endOfReason: endOfReason}));
    // setStudySet(studySetInner); // StudySetはそのセットで出題される可能性のあるすべての語。次の20語に進むまで変更しない
    const saved = save(quizzesInner, ua, storageData, updatedWordsStatuses, studySet.index!.wordSetNo);
    setStorageData(saved);

    setCurrentScreen('result');
    console.info('問題終了時処理が完了');
  };

  // ユーザーが画面上のボタンを押したときの処理(ここで扱うボタンは画面を横断する物に限る)
  const onUserButtonClick = (buttonName: string) => {
    switch(buttonName) {
      case 'next':
        const extracted = extractFromWords(
          studySet.remaining,
          20,
          storageData.wordStatus
        );
        setStudySet(prev => ({
          ...prev,
          words: extracted,
          quizzes: extracted.map(createQuiz4),
          studyMode: 'normal',
          remaining: studySet.remaining.filter(w => !extracted.includes(w)),
        }));
        setCurrentScreen('study');
        console.info('次の20語に進むボタンの処理が完了');
        break;
      case 'home':
        setStudySet(prev => ({
          ...prev,
          studyMode: 'normal',
        }));
        setCurrentScreen('home');
        console.info('ホームボタンの処理が完了');
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
        console.info('復習ボタンの処理が完了');
        break;
      default: 
        console.error('ボタン名が不正です');
        break;
    }
  };

/* HomeScreenで単語セットが選択されたときの処理
 * - 受け取った単語セットに該当する単語データを読み込む
 * - その単語データを元に、学習セット、クイズ、残りの単語を設定する。最後に、学習画面に遷移する
 */
  const onSelectedWordSet = (series: Series, index: WordSetIndex) => {
    // 単語データの読み込み
    loadFromWordJson(index)
      .then(wordSet => {
        const wl = extractFromWords(wordSet, 20, storageData.wordStatus);
        setStudySet(prev => ({
          ...prev,
          words: wl,
          quizzes: wl.map(createQuiz4),
          studyMode: 'normal',
          remaining: wordSet.filter(w => !wl.includes(w)),
          index: index,
          series: series,
        }));
        setCurrentScreen('study');
        console.info('単語セット選択時の処理が完了', index.filePath);
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
