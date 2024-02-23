import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { StudyScreen } from './StudyScreen';
import { Quiz } from '../models/Quiz';
import { StudySet } from '../StudySet';


describe('StudyScreen', () => {
  const onEndQuiz = jest.fn();
  
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.resetAllMocks();
  }); 

  it('通常学習 問題が正しく表示されること', () => {
    const studySet: StudySet = {
      words: [],
      quizzes: [
      new Quiz('Question 1', 0, ['Option 10', 'Option 11', 'Option 12', 'Option 13']),
      new Quiz('Question 2', 1, ['Option 20', 'Option 21', 'Option 22', 'Option 23']),
      new Quiz('Question 3', 2, ['Option 30', 'Option 31', 'Option 32', 'Option 33']),
      new Quiz('Question 4', 3, ['Option 40', 'Option 41', 'Option 42', 'Option 43']),
      ],
      studyMode: 'normal',
      index: {
        wordSetNo: 'test',
        wordSetName: 'Test',
        filePath: '/path/to/test.json',
        size: 20,
      },
      remaining: [],
      series: {
        seriesNo: 0,
        seriesDescription: 'Test Series',
        seriesName: 'TOEIC Service List - Part1',
        size: 20,
        wordSets: [],
      }
    };

    render(
      <StudyScreen
        studySet={studySet}
        onEndQuiz={onEndQuiz}
      />
    );
    expect(screen.getByText(/^通常学習/)).toBeInTheDocument();
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText(`${studySet.series?.seriesName} - ${studySet.index?.wordSetName}`)).toBeInTheDocument();
  });

  it('復習 問題が正しく表示されること', () => {
    const studySet: StudySet = {
      words: [],
      quizzes: [
        new Quiz('Question 1', 0, ['Option 10', 'Option 11', 'Option 12', 'Option 13']),
        new Quiz('Question 2', 1, ['Option 20', 'Option 21', 'Option 22', 'Option 23']),
        new Quiz('Question 3', 2, ['Option 30', 'Option 31', 'Option 32', 'Option 33']),
        new Quiz('Question 4', 3, ['Option 40', 'Option 41', 'Option 42', 'Option 43']),
      ],
      studyMode: 'retry',
      index: {
        wordSetNo: 'test',
        wordSetName: 'Test',
        filePath: '/path/to/test.json',
        size: 20,
      },
      remaining: [],
      series: null,
    };

    render(
      <StudyScreen
        studySet={studySet}
        onEndQuiz={onEndQuiz}
      />
    );
    expect(screen.getByText(/^復習/)).toBeInTheDocument();
    expect(screen.getByText('Question 1')).toBeInTheDocument();
  });

  it('基本的な流れ 正常終了', async () => {
    const studySet: StudySet = {
      words: [],
      quizzes: [
        new Quiz('Question 1', 0, ['Option 10', 'Option 11', 'Option 12', 'Option 13']),
        new Quiz('Question 2', 1, ['Option 20', 'Option 21', 'Option 22', 'Option 23']),
        new Quiz('Question 3', 2, ['Option 30', 'Option 31', 'Option 32', 'Option 33']),
        new Quiz('Question 4', 3, ['Option 40', 'Option 41', 'Option 42', 'Option 43']),
      ],
      studyMode: 'normal',
      index: {
        wordSetNo: 'test',
        wordSetName: 'Test',
        filePath: '/path/to/test.json',
        size: 20,
      },
      remaining: [],
      series: null,
    };

    render(
      <StudyScreen
        studySet={studySet}
        onEndQuiz={onEndQuiz}
      />
    );
    
    // 1問目 表示時
    {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
      expect(screen.getByText('Option 10')).toHaveClass('default');
      expect(screen.getByText('Option 11')).toHaveClass('default');
      expect(screen.getByText('Option 12')).toHaveClass('default');
      expect(screen.getByText('Option 13')).toHaveClass('default');
      expect(screen.getByText('スキップ')).toHaveClass('default');
      expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
      expect(screen.getByRole('progressbar')).toHaveAttribute('max', '4');
    }
    
    // 1問目 回答時
    act(() => {
      fireEvent.click(screen.getByText('Option 11'));
      jest.advanceTimersByTime(1500);
    });
    
    // 2問目 表示時
    await waitFor(() => {
      expect(screen.getByText('Question 2')).toBeInTheDocument();
      expect(screen.getByText('Option 20')).toHaveClass('default');
      expect(screen.getByText('Option 21')).toHaveClass('default');
      expect(screen.getByText('Option 22')).toHaveClass('default');
      expect(screen.getByText('Option 23')).toHaveClass('default');
      expect(screen.getByText('スキップ')).toHaveClass('default');
      expect(screen.getByRole('progressbar')).toHaveAttribute('value', '1');
      expect(screen.getByRole('progressbar')).toHaveAttribute('max', '4');
    });

    // 2問目 回答時
    await waitFor(() => {
      act(() => {
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByText('Option 21'));
        
        // 正答なのでボタンのスタイルが[デフォルト, 正答, デフォルト, デフォルト]であることを確認
        // また、この間ボタンがロックされていることを確認
        expect(screen.getByText('Option 20')).toHaveClass('default');
        expect(screen.getByText('Option 21')).toHaveClass('correct');
        expect(screen.getByText('Option 22')).toHaveClass('default');
        expect(screen.getByText('Option 23')).toHaveClass('default');
        expect(screen.getByText('スキップ')).toHaveClass('default');
        expect(screen.getByText('Option 20')).toBeDisabled();
        expect(screen.getByText('Option 21')).toBeDisabled();
        expect(screen.getByText('Option 22')).toBeDisabled();
        expect(screen.getByText('Option 23')).toBeDisabled();
        expect(screen.getByText('スキップ')).toBeDisabled();
        expect(screen.getByRole('checkbox')).toBeChecked();

        jest.advanceTimersByTime(1500);
      });
    }, { timeout: 3000 });
    
    // 3問目 表示時
    await waitFor(() => {
      // 2問目のチェックがクリアされる
      expect(screen.getByText('Question 3')).toBeInTheDocument();
      expect(screen.getByText('Option 30')).toHaveClass('default');
      expect(screen.getByText('Option 31')).toHaveClass('default');
      expect(screen.getByText('Option 32')).toHaveClass('default');
      expect(screen.getByText('Option 33')).toHaveClass('default');
      expect(screen.getByText('スキップ')).toHaveClass('default');
      expect(screen.getByRole('checkbox')).not.toBeChecked();
      expect(screen.getByRole('progressbar')).toHaveAttribute('value', '2');
      expect(screen.getByRole('progressbar')).toHaveAttribute('max', '4');
    });

    // 3問目 回答時
    await waitFor(() => {
      act(() => {
        fireEvent.click(screen.getByText('Option 31'));
        
        // 誤答なのでボタンのスタイルが[デフォルト, 誤答, 本当の正解, デフォルト]であることを確認
        expect(screen.getByText('Option 30')).toHaveClass('default');
        expect(screen.getByText('Option 31')).toHaveClass('incorrect');
        expect(screen.getByText('Option 32')).toHaveClass('actual');
        expect(screen.getByText('Option 33')).toHaveClass('default');
        expect(screen.getByText('スキップ')).toHaveClass('default');

        jest.advanceTimersByTime(1500);
      });
    }, { timeout: 3000 });

    // 4問目 表示時
    await waitFor(() => {
      expect(screen.getByText('Question 4')).toBeInTheDocument();
      expect(screen.getByText('Option 40')).toHaveClass('default');
      expect(screen.getByText('Option 41')).toHaveClass('default');
      expect(screen.getByText('Option 42')).toHaveClass('default');
      expect(screen.getByText('Option 43')).toHaveClass('default');
      expect(screen.getByText('スキップ')).toHaveClass('default');
      expect(screen.getByRole('progressbar')).toHaveAttribute('value', '3');
      expect(screen.getByRole('progressbar')).toHaveAttribute('max', '4');
    });

    // 4問目 スキップ時
    await waitFor(() => {
      act(() => {
        fireEvent.click(screen.getByText('スキップ'));
        
        // スキップしたのでボタンのスタイルが[デフォルト, デフォルト, デフォルト, 本当の正解]であることを確認
        expect(screen.getByText('Option 40')).toHaveClass('default');
        expect(screen.getByText('Option 41')).toHaveClass('default');
        expect(screen.getByText('Option 42')).toHaveClass('default');
        expect(screen.getByText('Option 43')).toHaveClass('actual');
        expect(screen.getByText('スキップ')).toHaveClass('incorrect');

        jest.advanceTimersByTime(1500);
      });
    }, { timeout: 3000 });
  
    // 結果発表
    await waitFor(() => {
      expect(onEndQuiz).toHaveBeenCalledTimes(1);
      expect(onEndQuiz).toHaveBeenCalledWith([
        { option: 1, checked: false },
        { option: 1, checked: true },
        { option: 1, checked: false },
        { option: -1, checked: false },
      ]);
    }, { timeout: 3000 });
  });

  test('基本的な流れ 「やめる」選択時 1問以上回答済み', async () => {
    const studySet: StudySet = {
      words: [],
      quizzes: [
        new Quiz('Question 1', 0, ['Option 10', 'Option 11', 'Option 12', 'Option 13']),
        new Quiz('Question 2', 1, ['Option 20', 'Option 21', 'Option 22', 'Option 23']),
      ],
      studyMode: 'normal',
      index: {
        wordSetNo: 'test',
        wordSetName: 'Test',
        filePath: '/path/to/test.json',
        size: 20,
      },
      remaining: [],
      series: null,
    };

    render(
      <StudyScreen
        studySet={studySet}
        onEndQuiz={onEndQuiz}
      />
    );

    // 1問目 回答
    act(() => {
      fireEvent.click(screen.getByText('Option 11'));
      jest.advanceTimersByTime(1500);
    });

    // 2問目 「やめる」選択
    await waitFor(() => {
      act(() => {
        expect(screen.getByText('Question 2')).toBeInTheDocument();
        fireEvent.click(screen.getByText('やめる'));
      });
    }, { timeout: 3000 });

    expect(onEndQuiz).toHaveBeenCalledTimes(1);
    expect(onEndQuiz).toHaveBeenCalledWith([
      { option: 1, checked: false },
    ]);


  });
  test('基本的な流れ 「やめる」選択時 1問も解いていない', () => {
    const studySet: StudySet = {
      words: [],
      quizzes: [
        new Quiz('Question 1', 0, ['Option 10', 'Option 11', 'Option 12', 'Option 13']),
      ],
      studyMode: 'normal',
      index: {
        wordSetNo: 'test',
        wordSetName: 'Test',
        filePath: '/path/to/test.json',
        size: 20,
      },
      remaining: [],
      series: null,
    };

    render(
      <StudyScreen
        studySet={studySet}
        onEndQuiz={onEndQuiz}
      />
    );

    // 1問目 「やめる」選択
    act(() => {
      fireEvent.click(screen.getByText('やめる'));
    });

    expect(onEndQuiz).toHaveBeenCalledTimes(1);
    expect(onEndQuiz).toHaveBeenCalledWith([
    ]);

  });
});