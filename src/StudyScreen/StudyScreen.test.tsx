import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { StudyScreen } from './StudyScreen';
import { Quiz } from '../models/Quiz';

jest.useFakeTimers();

describe('StudyScreen', () => {
  const quizzes = [
    new Quiz('Question 1', 0, ['Option 10', 'Option 11', 'Option 12', 'Option 13']),
    new Quiz('Question 2', 1, ['Option 20', 'Option 21', 'Option 22', 'Option 23']),
    new Quiz('Question 3', 2, ['Option 30', 'Option 31', 'Option 32', 'Option 33']),
  ];

  const onEndQuiz = jest.fn();

  beforeEach(() => {
    render(
      <StudyScreen
        quizzes={quizzes}
        studyMode="normal"
        onEndQuiz={onEndQuiz}
      />
    );
  });

  it('問題が正しく表示されること', () => {
    expect(screen.getByText('Question 1')).toBeInTheDocument();
  });

  it('問題の表示と回答 基本的な流れ 正常終了', async () => {
    // 1問目
    act(() => {
      fireEvent.click(screen.getByText('Option 11'));
      jest.advanceTimersByTime(1500);
    });

    // 2問目 画面遷移とスタイルの確認 正答時
    await waitFor(() => {
      expect(screen.getByText('Question 2')).toBeInTheDocument();
      act(() => {
        fireEvent.click(screen.getByText('Option 21'));
        jest.advanceTimersByTime(1500);
      });
    }, { timeout: 3000 });
    
    // 3問目 画面遷移とスタイルの確認 誤答時
    // 2問目のチェックがクリアされる
    await waitFor(() => {
      expect(screen.getByText('Question 3')).toBeInTheDocument();
      act(() => {
        fireEvent.click(screen.getByText('Option 31'));
        jest.advanceTimersByTime(1500);
      });
    }, { timeout: 3000 });

    // 4問目 画面遷移とスタイルの確認 スキップ時
  
    // 結果発表
    await waitFor(() => {
      expect(onEndQuiz).toHaveBeenCalledTimes(1);
      expect(onEndQuiz).toHaveBeenCalledWith([
        { option: 1, checked: false },
        { option: 1, checked: false },
        { option: 1, checked: false },
      ]);
    }, { timeout: 3000 });
  });

  test.todo('基本的な流れ 「やめる」選択時 1問以上回答済み');
  test.todo('基本的な流れ 「やめる」選択時 1問も解いていない');
});