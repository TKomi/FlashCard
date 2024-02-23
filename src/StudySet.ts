import { Quiz } from "./models/Quiz";
import { Word } from "./models/Word";

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
};
