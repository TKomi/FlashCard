/**
 * 単語に関する問題
 * 解答と回答選択肢から構成
 */
export class Quiz {
  /**
   * 解答
   * @type {string}
   */
  answer;

  /**
   * 回答選択肢
   * @type {string[]}
   */
  options;

  constructor(answer, options) {
    this.answer = answer;
    this.options = options;
  }

  fromObject(object) {
    return new Quiz(object.answer, object.options);
  }
}