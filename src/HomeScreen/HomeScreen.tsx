import React from "react";
import { Series, WordSetIndex } from "../models/WordSetIndex";
import { LearningInfo } from "../store/LS";
import styles from "./HomeScreen.module.scss";

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
  onSelectedWordSet: (_index: WordSetIndex) => void
}

/**
 * ホーム画面
 * 
 * @description
 * 【このコンポーネントの責務】
 * - 学習シリーズの一覧を表示する
 * - 単語セットを選択したときの処理を行う
 * @param props
 * @returns HomeScreenコンポーネント
 * @author TKomi
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

  function onClickGoButton(index: WordSetIndex) {
    if (onSelectedWordSet) {
      onSelectedWordSet(index);
    }
  }

  return (
    <div className={styles['homeScreen']}>
      <h1 className={styles['title']}>単語帳</h1>
      {
        seriesSet.map((series, index1) => (
          <div key={index1} className={styles['series']}>
            <h2 className={styles['series_title']}>{series.seriesName}</h2>
            <p className={styles['series_description']}>{series.seriesDescription}</p>
            <ul className={styles['list']}>
              {
                series.wordSets.map((wordSet, index2) => (
                  <li key={index2} className={styles['item']}>
                    <div className={styles['name']}>{wordSet.wordSetName}</div>
                    <div className={styles['size']}>{wordSet.size} Words</div>
                    <button onClick={() => onClickGoButton(wordSet)} className={styles['button']}>GO!</button>
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