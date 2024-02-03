/**
 * 単語に関する問題
 * 問題文、解答と回答選択肢から構成
 * Wordクラスの中に含まれている問題とは別物(このクラスはそこから作成される)
 */
export class Quiz {

  /**
   * 問題
   * @type {string} 問題文
   */
  question;

  /**
   * 解答
   * @type {number} 回答の選択肢のインデックス 0から始まる
   */
  answerIndex;

  /**
   * 回答選択肢
   * @type {string[]}
   */
  options;

  constructor(question, answer, options) {
    this.question = question;
    this.answerIndex = answer;
    this.options = options;
  }

  fromObject(object) {
    return new Quiz(object.question, object.answer, object.options);
  }
}