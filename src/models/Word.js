/**
 * 単語を表すクラス
 */
export class Word {
  /**
   * 英語スペル
   * @type {string}
   */
  word;

  /**
   * クイズ
   * 答えと選択肢が入っている
   * @type {{answer: string, options: string[]}}
   */
  quiz;

  constructor(word, quiz) {
    this.word = word;
    this.quiz = quiz;
  }

  static fromObject(object) {
    return new Word(object.word, object.quiz);
  }
}