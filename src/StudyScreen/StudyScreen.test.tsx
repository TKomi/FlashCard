import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { StudyScreen } from './StudyScreen';
import { Quiz } from '../models/Quiz';

jest.useFakeTimers();

describe('StudyScreen', () => {
  const quizzes = [
    new Quiz('Question 1', 0, ['Option 1', 'Option 2', 'Option 3', 'Option 4']),
    new Quiz('Question 2', 1, ['Option 1', 'Option 2', 'Option 3', 'Option 4']),
    new Quiz('Question 3', 2, ['Option 1', 'Option 2', 'Option 3', 'Option 4']),
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

  it('問題の表示と回答 基本的な流れ', async () => {
    // 1問目
    act(() => {
      fireEvent.click(screen.getByText('Option 1'));
    });
    await waitFor(() => {
      expect(screen.getByText('Question 2')).toBeInTheDocument();
    }, { timeout: 1500 });

    // 2問目
    act(() => {
      setTimeout(() => {
        act(() => {
          fireEvent.click(screen.getByText('Option 2'));
        });
      }, 1500);
      jest.advanceTimersByTime(1500); // タイムライン: 1500ms
    });
    await waitFor(() => {
      expect(screen.getByText('Question 3')).toBeInTheDocument();
    }, { timeout: 1500 });
    
    // 3問目
    act(() => {
      setTimeout(() => {
        act(() => {
          fireEvent.click(screen.getByText('Option 3'));
        });
      }, 3000);
      jest.advanceTimersByTime(1500); // タイムライン: 3000ms
    });
    await waitFor(() => {
      expect(onEndQuiz).toHaveBeenCalledTimes(1);
      expect(onEndQuiz).toHaveBeenCalledWith([
        { option: 0, checked: false },
        { option: 1, checked: false },
        { option: 2, checked: false },
      ]);
    }, { timeout: 6000 });
  });

  it.skip('次の問題に進むこと', () => {
    fireEvent.click(screen.getByText('Option 1'));
    fireEvent.click(screen.getByText('Option 2'));
    fireEvent.click(screen.getByText('Option 3'));
    fireEvent.click(screen.getByText('Option 4'));

    expect(screen.getByText('Question 2')).toBeInTheDocument();
  });

  it.skip('クイズが終了した時にonEndQuizが呼ばれること', () => {
    fireEvent.click(screen.getByText('Option 1'));
    fireEvent.click(screen.getByText('Option 2'));
    fireEvent.click(screen.getByText('Option 3'));
    fireEvent.click(screen.getByText('Option 4'));

    fireEvent.click(screen.getByText('Option 1'));
    fireEvent.click(screen.getByText('Option 2'));
    fireEvent.click(screen.getByText('Option 3'));
    fireEvent.click(screen.getByText('Option 4'));

    fireEvent.click(screen.getByText('Option 1'));
    fireEvent.click(screen.getByText('Option 2'));
    fireEvent.click(screen.getByText('Option 3'));
    fireEvent.click(screen.getByText('Option 4'));

    expect(onEndQuiz).toHaveBeenCalledTimes(1);
    expect(onEndQuiz).toHaveBeenCalledWith([
      { option: 0, checked: false },
      { option: 1, checked: false },
      { option: 2, checked: false },
      { option: 3, checked: false },
      { option: 0, checked: false },
      { option: 1, checked: false },
      { option: 2, checked: false },
      { option: 3, checked: false },
      { option: 0, checked: false },
      { option: 1, checked: false },
      { option: 2, checked: false },
      { option: 3, checked: false },
    ]);
  });
});