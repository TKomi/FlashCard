import { useEffect, useState } from 'react';
import StudyScreen from './StudyScreen/StudyScreen';
import { Word } from './models/Word';

function App() {
  // 読み込んだ単語データの一覧
  const [wordList, setWordList] = useState([]);

  // 起動時処理
  useEffect(() => {
    fetch('./data/toeic_service_list.json')
      .then(response => response.json())
      .then(data => {
        setWordList(data.map(Word.fromObject));
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>TOEIC単語帳</h1>
      <StudyScreen wordSet={wordList} />
    </div>
  );
}



export default App;
