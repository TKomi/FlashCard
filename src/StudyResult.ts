import { UserAnswer } from "./models/Quiz";

/**
 * 学習画面の終了状況
 */
export type StudyResult = {
  /**
   * 学習画面でのユーザーの回答の一覧
   * 出題順
   * 全問含まれているわけではなく、途中で中断した場合などには、その時点までの回答のみが含まれる
   */
  userAnswers: UserAnswer[];

  /**
   * 終了理由
   * - finish: 最後まで回答した
   * - quit: 途中で中断した
   */
  endOfReason: 'finish' | 'quit';
}
