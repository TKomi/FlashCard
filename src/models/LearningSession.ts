export type AnswerHistoryItem = {
  w: string;
  c: boolean;
};

export type LearningSessionCtorParams = {
  sessionId: string;
  wordSetNo: string;
  completionDate: string;
  answerHistory: AnswerHistoryItem[];
}


/**
 * 学習セッション
 */
export class LearningSession {

  /**
   * 学習セッションID
   */
  sessionId: string;

  /**
   * 単語セットNo
   */
  wordSetNo: string;

  /**
   * 学習完了日時 (format: ISO8601 date-time string)
   */
  completionDate: string;

  /**
   * 回答履歴
   * - このセッションで学習した単語が、古い物から新しい物の順で格納されている
   * - 各要素には、単語と正解不正解の情報が格納されている
   */
  answerHistory: AnswerHistoryItem[];

  /**
   * @param sessionData - 学習セッションのデータ
   */
  constructor(sessionData: LearningSessionCtorParams) {
    this.sessionId = sessionData.sessionId;
    this.wordSetNo = sessionData.wordSetNo;
    this.completionDate = sessionData.completionDate;
    this.answerHistory = sessionData.answerHistory;
  }

}
