// eslint-disable-next-line no-unused-vars
import { Word } from '../models/Word';

/**
 * 単語を使って、4択クイズを作成する
 * 
 * @param {Word[]} word 単語
 * @returns 作成されたクイズ
 */
export function createQuiz4(word) {
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
    options[ans_index] = word.quiz.answer;
    options[dummy1_index] = word.quiz.options[0];
    options[dummy2_index] = word.quiz.options[1];
    options[dummy3_index] = word.quiz.options[2];

    const quiz = {
      question: word.word,
      options,
      answer: ans_index
    };

  return quiz;
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
