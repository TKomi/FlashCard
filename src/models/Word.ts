/**
 * 単語を表すクラス
 */
export class Word {
  /**
   * 英語スペル
   */
  word: string;

  /**
   * クイズ
   * 答えと選択肢が入っている
   */
  quiz: { answer: string, options: string[] };

  constructor(word: string, quiz: { answer: string, options: string[] }) {
    this.word = word;
    this.quiz = quiz;
  }

  static fromObject(object: { word: string, quiz: { answer: string, options: string[] } }) {
    return new Word(object.word, object.quiz);
  }
}