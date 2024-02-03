// eslint-disable-next-line no-unused-vars
import { Quiz } from '../models/Quiz';
import React, { useEffect, useState } from 'react';


/**
 * クイズ1問の選択肢ボタン
 * 正解の選択肢がクリックされたら正誤判定して表示し、onAnswerを呼び出す
 *   正誤表示する時間は1秒とする
 *   すべての選択肢ボタンはロックされ、クリックできない状態にする
 * 正誤表示が終わったらonNextQuizを呼び出す
 * @param {{quiz: Quiz, onAnswer: (userAnswer: number) => void, onNextQuiz: (userAnswer: number) => void}} param0 
 */
function OptionButtons({quiz, onAnswer, onNextQuiz}) {
  // ステート
  // ロック状態: boolean デフォルトはfalse(ロックされていない)
  const [isLocked, setIsLocked] = useState(false);

  // 回答ボタンのスタイル(クラス): string[]
  // スタイルの選択肢はdefault(未回答), correct(正解), incorrect(不正解), actual(本当の正解)
  const [buttonStyle, setButtonStyle] = useState(["default", "default", "default", "default"]);

  // スキップボタンのスタイル(クラス): string
  // スタイルの選択肢はdefault(未回答), incorrect(不正解)
  const [skipButtonStyle, setSkipButtonStyle] = useState("default");

  useEffect(() => {
    // スタイルの初期化
    setButtonStyle(["default", "default", "default", "default"]);
    setSkipButtonStyle("default");
  }, [quiz])

  useEffect(() => {
    console.log(skipButtonStyle);
  }, [skipButtonStyle])

  // ユーザーが回答した後の処理
  const onAnswerInner = (userAnswer) => {
    // 1. ボタンをロックする
    setIsLocked(true);
    if (onAnswer) {
      onAnswer(userAnswer);
    }

    // 2.ユーザーの回答にあわせてスタイルを変更する
    // 正誤判定時のスタイル
    const nextStyle = ["default", "default", "default", "default"];
    let nextSkipStyle = "default";

    // 正誤判定し、スタイルを変更する
    if(quiz.answer === userAnswer){
      // 正解の場合。
      // 選んでおらず、不正解: defaultのまま
      // 選んでおり、正解
      nextStyle[userAnswer] = "correct";
    } else if (userAnswer === -1) {
      // スキップした場合。
      // 選んでいない選択肢: defaultのまま
      // スキップボタン: 不正解
      nextSkipStyle = "incorrect";
      // 選んでおらず、正解
      nextStyle[quiz.answer] = "actual";
    } else {
      // スキップ以外の不正解の場合。
      // 選んでおらず、不正解: defaultのまま
      // 選んでおらず、正解
      nextStyle[quiz.answer] = "actual";
      // 選んでおり、不正解
      nextStyle[userAnswer] = "incorrect";
    }
    setButtonStyle(nextStyle);
    setSkipButtonStyle(nextSkipStyle);

    // 3. 1秒後にロックを解除し、次の問題に進む
    setTimeout(() => {
      setIsLocked(false);
      if (onNextQuiz){
        onNextQuiz(userAnswer);
      }
    }, 1000);
  
  }

  return (
    <div>
      {quiz.options.map((option, index) => (
        <button key={index} onClick={() => onAnswerInner(index)} disabled={isLocked} className={`option-button ${buttonStyle[index]}`}>{option}</button>
      ))}
      <button onClick={() => onAnswerInner(-1)} disabled={isLocked} className={`option-button ${skipButtonStyle}`}>スキップ</button>
    </div>
  );
}

export default OptionButtons;