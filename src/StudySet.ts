import { Quiz } from "./models/Quiz";
import { Word } from "./models/Word";
import { Series, WordSetIndex } from "./models/WordSetIndex";

/**
 * アプリの状態を表すデータの一つで、学習セット(学習画面〜リザルト画面で扱う単語や問題のデータ)を表す
 */
export type StudySet = {
  /**
   * 当該セットで扱う単語の一覧
   */
  words: Word[];
  
  /**
   * 当該セットで扱う問題の一覧
   * 順番はwordsと対応している
   */
  quizzes: Quiz[];

  /**
   * 学習モード: 'normal' or 'retry'
   */
  studyMode: 'normal' | 'retry';

  /**
   * 現在取り組んでいる学習シリーズ情報
   */
  series: Series | null;

  /**
   * 現在取り組んでいる単語セット情報
   */
  index: WordSetIndex | null;

  /**
   * 未出題の単語の一覧
   */
  remaining: Word[];
};
