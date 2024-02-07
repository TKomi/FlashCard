
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

export default HomeScreen;