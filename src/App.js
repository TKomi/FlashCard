import './App.css';
import { useEffect, useState } from 'react';
import StudyScreen from './StudyScreen/StudyScreen';
import ResultScreen from './ResultScreen';
import { Word } from './models/Word';
import { createQuiz4 } from './StudyScreen/CreateQuiz';

function App() {
  const [currentScreen, setCurrentScreen] = useState('study');

  // 以下、アプリの現在の状態(読み込んだ単語の一覧、クイズの一覧、ユーザーの回答の一覧)
  // 読み込んだ単語データの一覧
  const [wordList, setWordList] = useState([]);

  // クイズの一覧
  const [quizzes, setQuizzes] = useState([]);

  // ユーザーの回答の一覧
  const [userAnswers, setUserAnswers] = useState([]);

  // 起動時処理
  useEffect(() => {
    fetch('./data/toeic_service_list.json')
      .then(response => response.json())
      .then(data => {
        const wl = data.map(Word.fromObject);
        setWordList(wl);
        setQuizzes(wl.map(createQuiz4));
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>TOEIC単語帳</h1>
      {
        currentScreen === 'study' ? (
          <StudyScreen quizzes={quizzes} onEndQuiz={() => {
            setCurrentScreen('result');
          }} />
        ) : currentScreen === 'result' ? (
          <ResultScreen words={wordList} quizzes={quizzes} userAnswers={userAnswers} />
        ) : (
          <div>
            <p>エラー</p>
          </div>
        )
      }
    </div>
  );
}



export default App;
