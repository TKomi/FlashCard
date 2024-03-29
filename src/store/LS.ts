import { LearningSession, LearningSessionCtorParams } from '../models/LearningSession.ts';
import { WordStatus } from '../models/WordStatus.ts';
import Schema from './ls.schema.json';


/**
 * 単語セット学習状況
 */
export type LearningInfo = {
  /**
   * 単語セットNo
   */
  wordSetNo: number;

  /**
   * ステータスごとの学習状況
   */
  groupsAndCounts: GroupsAndCounts;

  /**
   * 単語セットの学習回数
   */
  learningCount: number;
};

/**
 * ステータスごとの学習状況
 */
export type GroupsAndCounts = {
  /**
   * 未学習の単語数
   */
  group0: number;

  /**
   * 苦手な単語数
   */
  group1: number;

  /**
   * うろ覚えの単語数
   */
  group2: number;

  /**
   * 覚えた単語数
   */
  group3: number;
};


/**
 * LocalStorageとのやりとりに使うデータ
 */
export type FlashCardData = {
  // /**
  //  * スキーマのバージョン
  //  */
  // databaseVersion: string;

  /**
   * 学習セッションの配列
   */
  learningSession: LearningSession[];

  /**
   * 単語をキーとし、WordStatusオブジェクトを値とするオブジェクト
   */
  wordStatus: Record<string, WordStatus>;

  /**
   * WordSetStatusオブジェクトの配列
   */
  wordSetStatus: LearningInfo[];
};

/**
 * LocalStorageとのやりとりを行うオブジェクト
 */
export const LS = {
  /**
   * LocalStorageにデータを保存する
   * @param data 保存するデータ
   */
  save(data: FlashCardData): void {
    const key = "flashCard"; // 固定のキー
    const dbVersion = Schema.description; // スキーマのバージョン
    
    const saveTarget = {...data, databaseVersion: dbVersion};
    localStorage.setItem(key, JSON.stringify(saveTarget));
    console.info('LocalStorageへデータ保存完了');
  },

  /**
   * LocalStorageからデータを読み込む
   * データがない場合には初期値を返す
   * @returns LocalStorageに保存されているデータ
   */
  loadOrDefault(): FlashCardData {
    const key = "flashCard"; // 固定のキー

    const jsonString = localStorage.getItem(key);
    const json = jsonString ? JSON.parse(jsonString) : getInitialState()
    const result = {
      databaseVersion: json.databaseVersion,
      learningSession: json.learningSession.map((session: LearningSessionCtorParams) => new LearningSession(session)),
      wordStatus: (Object.entries(json.wordStatus) as unknown as [string, WordStatus][])
      .reduce((reduced, [word, status]) => {
        reduced[status.word] = new WordStatus(word, status.lastLearnedDate, status.answerHistory, status.status);
        return reduced;
      }, {} as  Record<string, WordStatus>), // json.wordStatusの各要素をWordStatusに変換し、reduceでまとめる
      wordSetStatus: json.wordSetStatus || [],
    };

    // スキーマのバージョンが違う場合の変換処理をここに入れる予定

    console.info('LocalStorageからデータ読込完了');
    return result;
  }
};

/**
 * LocalStorageに保存されるデータの初期値を返す
 * @returns 初期値。読み込むたびに新しいオブジェクトを返す
 */
export function getInitialState(): FlashCardData & { databaseVersion: string } {
  return {
    databaseVersion: Schema.description,
    learningSession: [],
    wordStatus: {},
    wordSetStatus: []
  };
}


