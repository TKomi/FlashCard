import React from "react";
import { Series } from "./models/WordSetIndex";
import { LearningInfo } from "./store/LS";

export type Props = {
  /**
   * 単語帳のシリーズの配列
   */
  seriesSet: Series[],

  /**
   * 単語帳の学習状況の配列
   */
  wordSetStatus: LearningInfo[],

  /**
   * 単語セットが選択されたときの処理
   * @param filePath 選択された単語セットのファイルパス
   */
  onSelectedWordSet: (filePath: string) => void
}

/**
 * ホーム画面
 */
export const HomeScreen: React.FC<Props> = ({seriesSet, wordSetStatus, onSelectedWordSet}) => {
  // seriesSetの順番、シリーズ内の単語セットの順番に対応する、単語セットの学習状況の配列
  // 将来のための実装をコメントアウト
  // const wordSetStatusOrdered = useMemo(() => {
  //   const wordSetStatusOrdered = [];
  //   for (const series of seriesSet) {
  //     const s = [];
  //     for (const wordSet of series.wordSets) {
  //       const status = (wordSetStatus?? []).find(status => status.filePath === wordSet.filePath);
  //       if (status) {
  //         s.push(status);
  //       } else {
  //         s.push({
  //           wordSetNo: wordSet.wordSetNo,
  //           group0: wordSet.size,
  //           group1: 0,
  //           group2: 0,
  //           group3: 0,
  //         });
  //       }
  //     }
  //     wordSetStatusOrdered.push(s);
  //   }
  //   return wordSetStatusOrdered;
  // }, [seriesSet, wordSetStatus]);

  function onClickGoButton(filePath: string) {
    if (onSelectedWordSet) {
      console.log('wordset selected', filePath);
      onSelectedWordSet(filePath);
    }
  }

  return (
    <div>
      <h1 className='homescreen-title'>単語帳</h1>
      {
        seriesSet.map((series, index1) => (
          <div key={index1} className='series-box'>
            <h2 className='homescreen-series-title'>{series.seriesName}</h2>
            <p className='homescreen-series-description'>{series.seriesDescription}</p>
            <ul className='ul-homescreen'>
              {
                series.wordSets.map((wordSet, index2) => (
                  <li key={index2} className='li-wordset'>
                    <div className='wordset-name'>{wordSet.wordSetName}</div>
                    <div className='wordset-size'>{wordSet.size} Words</div>
                    <button onClick={() => onClickGoButton(wordSet.filePath)} className='wordset-button'>GO!</button>
                  </li>
                ))
              }
            </ul>
          </div>
        ))
      }
    </div>
  );
}