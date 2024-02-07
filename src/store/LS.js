/**
 * @typedef {Object} LearningInfo 単語セット学習状況
 * @property {number} wordSetNo 単語セットNo
 * @property {GroupsAndCounts} groupsAndCounts ステータスごとの学習状況
 * @property {number} learningCount 単語セットの学習回数
 */

/**
 * @typedef {Object} GroupsAndCounts ステータスごとの学習状況
 * @property {number} group0 未学習の単語数
 * @property {number} group1 苦手な単語数
 * @property {number} group2 うろ覚えの単語数
 * @property {number} group3 覚えた単語数
 */

import { LearningSession } from '../models/LearningSession';
import { WordStatus } from '../models/WordStatus';
import Schema from './ls.schema.json';

/**
 * @typedef {Object} FlashCardData LocalStorageとのやりとりに使うデータ
 * @property {import('../models/LearningSession').LearningSession[]} learningSession
 * @property {Object.<string, import('../models/WordStatus').WordStatus>} wordStatus 単語をキーとし、WordStatusオブジェクトを値とするオブジェクト
 * @property {LearningInfo[]} wordSetStatus WordSetStatusオブジェクトの配列
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
    const dbVersion = Schema.description; // スキーマのバージョン
    
    const saveTarget = {...data, databaseVersion: dbVersion};
    localStorage.setItem(key, JSON.stringify(saveTarget));
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
      databaseVersion: json.databaseVersion,
      learningSession: json.learningSession.map(session => new LearningSession(session)),
      wordStatus: Object.entries(json.wordStatus).reduce((reduced, [word, status]) => {
        reduced[word] = new WordStatus(status.word, status.lastLearnedDate, status.answerHistory, status.status);
        return reduced;
      }, {}), // json.wordStatusの各要素をWordStatusに変換し、reduceでまとめる
      wordSetStatus: json.wordSetStatus || [],
    };

    // スキーマのバージョンが違う場合の変換処理をここに入れる予定

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


