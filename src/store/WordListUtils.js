import { Word } from '../models/Word';

/**
 * Jsonファイルから単語を取得し、Wordオブジェクトの配列として返す
 * @return {Promise<Word[]>} 単語の配列
 */
export async function loadFromWordJson(jsonFilePath) {
    return  await fetch('data/'+jsonFilePath)
      .then(response => response.json())
      .then(data => data.map(Word.fromObject));
}

/**
 * wordListから最大num個の単語を、規則に従って抽出する
 * 
 * - 規則1: まだ一度も学習していない単語+苦手単語を優先的に抽出する。ランダムに最大num個。
 * - 規則2: うろ覚えの単語をその次に抽出する。ランダムに、規則1と合計で最大num個。
 * - 規則3: それ以外の単語を抽出する。ランダムに、規則1と2と合計で最大num個。
 * 
 * 規則1から3の単語はランダムに並べ替える。
 * 
 * @param {Word[]} wordList 対象の単語リスト
 * @param {number} num 抽出する単語の数
 * @param {Object.<string, import('../models/WordStatus').WordStatus>} allWordStatus 単語をキーとし、WordStatusオブジェクトを値とするオブジェクト
 * - 過去の単語の学習状況を示すオブジェクト
 * - キーは単語、値はWordStatusオブジェクト
 * - ストレージから取り出したものを渡される想定
 * @return {Word[]} 抽出された単語の配列
 */
export function extractFromWordList(wordList, num, allWordStatus) {
  const group0 = []; // 未学習の単語リスト
  const group1 = []; // 苦手な単語リスト
  const group2 = []; // うろ覚えの単語リスト
  const group3 = []; // それ以外の単語リスト

  for(const word of wordList) {
    const status = allWordStatus[word.word];
    switch (status?.status) {
      case 1:
      case 2:
        group1.push(word);
        break;
      case 3:
      case 4:
        group2.push(word);
        break;
      case 5:
      case 6:
        group3.push(word);
        break;
      case undefined:
      default: 
        group0.push(word);
      break;
    }
  };

  const result = [];

  // 0群と1群をシャッフルして結合, 最大num個取得
  const shuffled01 = getShuffledArray([...group0, ...group1]);
  result.push(...shuffled01.slice(0, num));

  // まだ足りなければ2群をシャッフルして追加
  if (result.length < num) {
    const shuffled2 = getShuffledArray(group2);
    result.push(...shuffled2.slice(0, num - result.length));
  }

  // まだ足りなければ3群をシャッフルして追加
  if (result.length < num) {
    const shuffled3 = getShuffledArray(group3);
    result.push(...shuffled3.slice(0, num - result.length));
  }

  return getShuffledArray(result);
}

/**
 * 配列をシャッフルする
 * @param {any[]} array シャッフル対象の配列 副作用はありません。
 * @returns シャッフルされた配列
 */
export function getShuffledArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
