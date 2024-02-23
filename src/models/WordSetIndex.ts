/**
 * シリーズ
 */
export type Series = {
  /**
   * シリーズ番号
   */
  seriesNo: number;

  /**
   * シリーズ名
   */
  seriesName: string;

  /**
   * シリーズの説明
   */
  seriesDescription: string;

  /**
   * シリーズのサイズ(単語セット数)
   */
  size: number;

  /**
   * シリーズに含まれる単語セット
   */
  wordSets: WordSetIndex[];
};

/**
 * 単語セット(目次)
 */
export type WordSetIndex = {
  /**
   * 単語セットNo
   */
  wordSetNo: string;

  /**
   * 単語セット名
   */
  wordSetName: string;

  /**
   * 単語セットのファイルパス
   */
  filePath: string;

  /**
   * 単語セットのサイズ(単語数)
   */
  size: number;
};

/**
 * index.jsonを読み込むユーティリティ
 */
export const WordSetIndexUtil = {
  /**
   * index.jsonを読み込んで、単語セット情報を取得する
   * @param indexFilePath index.jsonのファイルパス
   * @returns 読込結果
   */
  async loadFromIndexJson(indexFilePath: string): Promise<Series[]> {
    return await fetch(indexFilePath)
      .then(response => response.json())
      .then(data => data.dataSet);
  },
};
