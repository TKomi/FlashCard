import { v4 as uuidv4 } from 'uuid';
import { LearningSession } from "../models/LearningSession";
import { Quiz, UserAnswer } from "../models/Quiz";
import { WordStatus } from "../models/WordStatus";
import { FlashCardData, LS } from "./LS";

/**
 * 学習セッション1件の情報を保存(追記)する
 * 
 * @param quizzes 出題された問題の一覧。
 * @param userAnswers ユーザーの回答の一覧。quizzesと順番が同じ。optionは回答選択肢で0から始まり、-1はスキップ。checkedはチェックボックスの状態。
 * @param oldFlashCardData LSから読み込んだ、既存の学習セッションデータ
 * - delete-insert方式のため、古いデータも必要となる
 * @param updatedWordsStatuses 更新後の単語の学習状況の一覧
 * - updateWordStatusesで作成したものをわたすこと
 * - updateWordStatuses関数の結果は他の箇所でも使いたかったため関数は分離した
 * @param wordSetNo 学習した単語セットの番号
 * @returns 保存後のデータ
 */
export function save(
  quizzes: Quiz[],
  userAnswers: UserAnswer[],
  oldFlashCardData: FlashCardData,
  updatedWordsStatuses: WordStatus[],
  wordSetNo: string
): FlashCardData {
  // 学習セッションの状況
  const learningSessionClone = [...oldFlashCardData.learningSession];
  learningSessionClone.push(new LearningSession({
    sessionId: uuidv4(),
    wordSetNo: wordSetNo,
    completionDate: new Date().toISOString(),
    answerHistory: userAnswers.map((answer, index) => {
      return {
        w: quizzes[index].question,
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
  console.info('学習セッションの保存が完了');
  return saveTarget;
}
