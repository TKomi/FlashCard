import { v4 as uuidv4 } from 'uuid';
import { LearningSession } from "../models/LearningSession";
import { Quiz, UserAnswer } from "../models/Quiz";
import { Word } from "../models/Word";
import { WordStatus } from "../models/WordStatus";
import { FlashCardData, LS } from "./LS";

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
export function save(
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
  for (const st of updatedWordsStatuses) {
    wordStatusClone[st.word] = st;
  }

  // WordSetStatus更新処理
  const wordSetStatusClone = [...oldFlashCardData.wordSetStatus];
  {
    let target = wordSetStatusClone.find(wss => wss.wordSetNo === 1);
    if (!target) {
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
