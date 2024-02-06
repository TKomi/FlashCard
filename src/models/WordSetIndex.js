/**
 * @typedef {Object} Series シリーズ
 * @property {number} seriesNo シリーズ番号
 * @property {string} seriesName シリーズ名
 * @property {string} seriesDescription シリーズの説明
 * @property {number} size シリーズのサイズ(単語セット数)
 * @property {WordSetIndex[]} wordSets シリーズに含まれる単語セット
 */

/**
 * @typedef {Object} WordSetIndex 単語セット(目次)
 * @property {number} wordSetNo 単語セット番号
 * @property {string} wordSetName 単語セット名
 * @property {string} filePath 単語セットのファイルパス
 * @property {number} size 単語セットのサイズ(単語数)
 */

/**
 * index.jsonを読み込む
 */
export const WordSetIndex = {

  async loadFromIndexJson(indexFilePath) {
    return await fetch('./data/index.json')
      .then(response => response.json())
      .then(data => data.dataSet);
  },
}