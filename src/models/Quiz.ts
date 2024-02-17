/**
 * 単語に関する問題
 * 問題文、解答と回答選択肢から構成
 * Wordクラスの中に含まれている問題とは別物(このクラスはそこから作成される)
 */
export class Quiz {
  /**
   * 問題
   */
  question: string;

  /**
   * 解答
   */
  answerIndex: number;

  /**
   * 回答選択肢
   */
  options: string[];

  constructor(question: string, answer: number, options: string[]) {
    this.question = question;
    this.answerIndex = answer;
    this.options = options;
  }

  fromObject(object: { question: string, answer: number, options: string[] }): Quiz {
    return new Quiz(object.question, object.answer, object.options);
  }
}


/**
 * 問題に対応するユーザーの回答
 */
export type UserAnswer = {

  /**
   * 選択肢のインデックス。0から始まる。-1は「スキップ」
   */
  option: number,

  /**
   * チェックボックスの状態
   */
  checked: boolean
}

