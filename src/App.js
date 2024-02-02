import { useEffect, useState } from 'react';

function App() {
  // 読み込んだ単語データの一覧
  const [wordList, setWordList] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  // 起動時処理
  useEffect(() => {
    fetch('./data/toeic_service_list.json')
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setWordList(data);
        setQuizzes(createQuiz(data));
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      {
        // 単語リストの表示
        wordList.map((word, index) => {
          return (
            <div key={index}>
              <p>{word.word}</p>
            </div>
          );
        })
      }
    </div>
  );
}

// 4択なので、選択肢の順列は4! = 24通り
// その順番をぜんぶ事前に用意しておく
// [0, 1, 2, 3]の並び順すべて
const Orders4 = [
  [0, 1, 2, 3],
  [0, 1, 3, 2],
  [0, 2, 1, 3],
  [0, 2, 3, 1],
  [0, 3, 1, 2],
  [0, 3, 2, 1],
  [1, 0, 2, 3],
  [1, 0, 3, 2],
  [1, 2, 0, 3],
  [1, 2, 3, 0],
  [1, 3, 0, 2],
  [1, 3, 2, 0],
  [2, 0, 1, 3],
  [2, 0, 3, 1],
  [2, 1, 0, 3],
  [2, 1, 3, 0],
  [2, 3, 0, 1],
  [2, 3, 1, 0],
  [3, 0, 1, 2],
  [3, 0, 2, 1],
  [3, 1, 0, 2],
  [3, 1, 2, 0],
  [3, 2, 0, 1],
  [3, 2, 1, 0]
];

// jsonデータを受け取って、クイズデータを作成する
function createQuiz(wordList) {
  const quizzes = [];
  for (let i = 0; i < wordList.length; i++) {
    // 解答の順番はOrders4の中からランダムに選ぶ
    const order = Orders4[Math.floor(Math.random() * Orders4.length)];

    // 正解の位置
    const ans_index = order[0];
    // ダミー選択肢1の位置
    const dummy1_index = order[1];
    // ダミー選択肢2の位置
    const dummy2_index = order[2];
    // ダミー選択肢3の位置
    const dummy3_index = order[3];

    // 問題選択肢の作成
    const options = [];
    options[ans_index] = wordList[i].quiz.answer;
    options[dummy1_index] = wordList[i].quiz.options[0];
    options[dummy2_index] = wordList[i].quiz.options[1];
    options[dummy3_index] = wordList[i].quiz.options[2];

    const quiz = {
      question: wordList[i].word,
      options,
      answer: ans_index
    };
    quizzes.push(quiz);
  }
  return quizzes;
}

export default App;
