
/**
 * 
 * @param {{seriesSet: import("./models/WordSetIndex").Series[], onSelectedWordSet: (filePath: string) => void}} param0 args
 * - seriesSet: シリーズの配列
 * - onSelectedWordSet: 単語セットが選択された時の処理
 * @returns HomeScreenコンポーネント
 */
function HomeScreen({seriesSet, onSelectedWordSet}) {
  function onClickGoButton(filePath) {
    if (onSelectedWordSet) {
      console.log('wordset selected', filePath);
      onSelectedWordSet(filePath);
    }
  }

  return (
    <div>
      <h1 className='home-screen-title'>単語帳</h1>
      {
        seriesSet.map((series, index1) => (
          <div key={index1}>
            <h2>{series.seriesName}</h2>
            <p>{series.seriesDescription}</p>
            <ul>
              {
                series.wordSets.map((wordSet, index2) => (
                  <li key={index2}>
                    <div>{wordSet.wordSetName}</div>
                    <div>{wordSet.size} Words</div>
                    <button onClick={() => onClickGoButton(wordSet.filePath)}>GO!</button>
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

export default HomeScreen;