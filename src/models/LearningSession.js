/**
 * @typedef {Object} AnswerHistoryItem
 * @property {string} w 単語
 * @property {boolean} c 正解ならtrue、不正解ならfalse
 */


/**
 * 学習セッション
 */
export class LearningSession {

  /**
   * 学習セッションID
   * @type {string}
   */
  sessionId;

  /**
   * 単語セットNo
   * @type {number}
   */
  wordSetNo;

  /**
   * 学習完了日時 (format: ISO8601 date-time string)
   * @type {string}
   */
  completionDate;

  /**
   * 回答履歴
   * - このセッションで学習した単語が、古い物から新しい物の順で格納されている
   * - 各要素には、単語と正解不正解の情報が格納されている
   * @type {AnswerHistoryItem[]}
   */
  answerHistory;

  /**
   * @param {object} sessionData - 学習セッションのデータ
   */
  constructor(sessionData) {
    this.sessionId = sessionData.sessionId;
    this.wordSetNo = sessionData.wordSetNo;
    this.completionDate = sessionData.completionDate;
    this.answerHistory = sessionData.answerHistory;
  }

}
