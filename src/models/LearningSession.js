/**
 * @typedef {Object} AnswerHistoryItem
 * @property {string} w 単語
 * @property {boolean} c 正解ならtrue、不正解ならfalse
 */

/**
 * @typedef {Object} LearningSession
 * @property {string} sessionId 学習セッションID
 * @property {string} wordSetId 単語セットID
 * @property {string} completionDate 学習完了日時 (format: ISO8601 date-time string)
 * @property {AnswerHistoryItem[]} answerHistory 回答履歴
 * - このセッションで学習した単語が、古い物から新しい物の順で格納されている
 * - 各要素には、単語と正解不正解の情報が格納されている
 */

/**
 * 学習セッションを管理するクラス
 * - learningSession.schema.jsonに準拠
 */
export class LearningSession {
  /**
   * @param {LearningSession} sessionData - 学習セッションのデータ
   */
  constructor(sessionData) {
    this.sessionId = sessionData.sessionId;
    this.wordSetId = sessionData.wordSetId;
    this.completionDate = sessionData.completionDate;
    this.answerHistory = sessionData.answerHistory;
  }

}
