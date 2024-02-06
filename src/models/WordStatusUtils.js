import { WordStatus } from "./WordStatus";

/**
 * 単語の現在の状態(未回答0、苦手12、うろ覚え34、覚えた56), 今回の回答が正解かどうかとチェックボックスの状態から、更新後のステータスを返す
 * 
 * @param {number} oldStatus 現在のステータス
 * @param {boolean} ansIsCorrect 今回の回答が正解かどうか
 * @param {boolean} checked チェックボックスの状態 // 未実装
 * @returns {0|1|2|3|4|5|6} 更新後のステータス
 */
function getUpdatedStatus(oldStatus, ansIsCorrect, checked = false){
  // 現在の状態はcheckedが反映されていない仮のもの
  switch(oldStatus) {
    case 0:
      if (!checked && ansIsCorrect) return 5;
      else if (checked && ansIsCorrect) return 4;
      else if (!checked && !ansIsCorrect) return 3;
      else return 2;
    case 1:
      if (!checked && ansIsCorrect) return 2;
      else return 1;
    case 2:
    case 3:
    case 4:
    case 5:
      if (!checked && ansIsCorrect) return oldStatus + 1;
      else if (checked && ansIsCorrect) return oldStatus;
      else return oldStatus - 1;
    case 6:
      if (!ansIsCorrect) return 5;
      else return 6;
    default:
      return 0;
  }
}

/**
 * 学習セット1件の終了後の各単語の学習状況(単語ステータス)を取得する
 * 
 * @param {Word[]} studySet 単語の一覧
 * @param {Quiz[]} quizzes クイズの一覧
 * - 順番は単語の一覧と同じ
 * @param {{option: number, checked: boolean}[]} userAnswers ユーザーの回答の一覧
 * - 順番は単語の一覧と同じ
 * @param {import("./store/LS").FlashCardData} saveData LSから読み込んだ、既存のデータ
 * @returns {WordStatus[]} 単語の学習状況の一覧
 * - 単語(クイズ, 回答)の一覧と同じ順番で、各単語の学習状況を格納した配列
 */
export function updateWordStatuses(studySet, quizzes, userAnswers, saveData) {
  const result = [];

  for (const word of studySet) {
    // 対応するwordStatusを取得, なければ新規作成
    const updated = saveData.wordStatus[word.word] || new WordStatus(word.word, new Date().toISOString(), [], 0);

    // dateを更新
    updated.lastLearnedDate = new Date().toISOString();

    // answerHistoryに最後の問題の正誤を追加
    const index = quizzes.findIndex(quiz => quiz.question === word.word);
    const quizCorrectness = getQuizCorrectness(quizzes, userAnswers, index);
    updated.answerHistory.push(quizCorrectness);

    // statusを更新
    updated.status = getUpdatedStatus(updated.status, quizCorrectness, userAnswers[index].checked);

    // wordStatusを更新
    result.push(updated);
  }

  return result;
}

/** クイズの一覧およびユーザーの回答の一覧を提供し、指定したインデックスの単語に関するクイズ1問の正誤を取得する
 * 
 * @param {Quiz[]} quizzes クイズの一覧
 * @param {{option: number, checked: boolean}[]} userAnswers ユーザーの回答の一覧。optionは回答選択肢で0から始まり、-1はスキップ。checkedはチェックボックスの状態。
 * @param {number} index 単語に対応するクイズのインデックス
 * @returns {boolean} 正解ならtrue, 不正解ならfalse
 */
function getQuizCorrectness(quizzes, userAnswers, index) {
  if (index !== -1) {
    return quizzes[index].answerIndex === userAnswers[index].option;
  }
  return false;
}


