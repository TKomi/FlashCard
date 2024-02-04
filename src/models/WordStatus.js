/**
 * 単語学習状況を表すクラス
 * wordStatus.schema.jsonに準拠
 */
export class WordStatus {
  /**
   * @param {string} word - 英単語スペル
   * @param {string} lastLearnedDate - 最後に学習した日時 (format: ISO8601 date-time string)
   * @param {boolean[]} answerHistory 過去の回答履歴
   * - 配列形式で、最新の回答が最後の要素
   * - 正解:true, 不正解:false
   * @param {number} status - 単語の状態 (0:未学習, 1:苦手, 2:うろ覚え, 3:覚えた)
   */
  constructor(word, lastLearnedDate, answerHistory, status) {
    this.word = word;
    this.lastLearnedDate = lastLearnedDate;
    this.answerHistory = answerHistory;
    this.status = status;
  }
}
