import { LearningSession } from '../models/LearningSession';
import { WordStatus } from '../models/WordStatus';

/**
 * @typedef {Object} FlashCardData LocalStorageとのやりとりに使うデータ
 * @property {import('../models/LearningSession').LearningSession[]} learningSession
 * @property {Object.<string, import('../models/WordStatus').WordStatus>} wordStatus 単語をキーとし、WordStatusオブジェクトを値とするオブジェクト
 * 
 */

/**
 * LocalStorageとのやりとりを行うオブジェクト
 */
export const LS = {
  /**
   * LocalStorageにデータを保存する
   * @param {FlashCardData} data 
   */
  save(data) {
    const key = "flashCard"; // 固定のキー

    localStorage.setItem(key, JSON.stringify(data));
  },

  /**
   * LocalStorageからデータを読み込む
   * データがない場合には初期値を返す
   * @returns {FlashCardData} LocalStorageに保存されているデータ
   */
  loadOrDefault() {
    const key = "flashCard"; // 固定のキー

    const jsonString = localStorage.getItem(key);
    const json = jsonString ? JSON.parse(jsonString) : Object.assign({}, initialState);
    const result = {
      learningSession: json.learningSession.map(session => new LearningSession(session)),
      wordStatus: Object.entries(json.wordStatus).reduce((reduced, [word, status]) => {
        reduced[word] = new WordStatus(status.word, status.lastLearnedDate, status.answerHistory, status.status);
        return reduced;
      }, {}), // json.wordStatusの各要素をWordStatusに変換し、reduceでまとめる
    };
    return result;
  }
};

/**
 * LocalStorageに保存されるデータの初期値
 * @type {FlashCardData}
 */
const initialState = {
  learningSession: [],
  wordStatus: {},
}


