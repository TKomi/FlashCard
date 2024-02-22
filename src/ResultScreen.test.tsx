import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ResultScreen } from './ResultScreen';
import { Quiz, UserAnswer } from './models/Quiz';
import { WordStatus } from './models/WordStatus';
import { StudySet } from './StudySet';
import { StudyResult } from './StudyResult';

describe('ResultScreen 基本項目', () => {
  const studySet: StudySet = {
    words: [
      { word: 'Word 1', quiz: { answer: 'Answer 1', options: ['option1', 'option2'] } },
      { word: 'Word 2', quiz: { answer: 'Answer 2', options: ['option1', 'option2'] } },
    ],
    quizzes: [
      new Quiz('Word 1', 2, ['option1', 'option2', 'Answer 1']),
      new Quiz('Word 2', 2, ['option1', 'option2', 'Answer 2']),
    ],
    studyMode: 'normal',
  };
  const studyResult: StudyResult = {
    userAnswers: [
      { option: 1, checked: true },
      { option: 2, checked: false },
    ],
    endOfReason: 'finish',
  };
  const wordStatus: Record<string, WordStatus> = {
    'Word 1': { word: 'Word 1', status: 1, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
    'Word 2': { word: 'Word 2', status: 6, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
  };
  const countOfNext = 2;
  const onUserButtonClick = jest.fn();

  beforeEach(() => {
    render(
      <ResultScreen
        studySet={studySet}
        studyResult={studyResult}
        wordStatus={wordStatus}
        countOfNext={countOfNext}
        onUserButtonClick={onUserButtonClick}
      />
    );
  });

  it('タイトルが描画されること', () => {
    expect(screen.getByText('TOEIC Service List - Part1')).toBeInTheDocument();
  });

  it('サブタイトルが描画されること', () => {
    expect(screen.getByText('通常学習 2Words')).toBeInTheDocument();
  });

  it('正解数、不正解数、スキップ数が描画されること', () => {
    expect(screen.getByText('○1 / ×1 / -0')).toBeInTheDocument();
  });

  it('結果のリストが描画されること', () => {
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('Word 1')).toBeInTheDocument();
    expect(screen.getByText('○')).toBeInTheDocument();
    expect(screen.getByText('✔')).toBeInTheDocument();
    expect(screen.getByText('Answer 1')).toBeInTheDocument();
    expect(screen.getByText('苦手')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
    expect(screen.getByText('Word 2')).toBeInTheDocument();
    expect(screen.getByText('×')).toBeInTheDocument();
    expect(screen.getByText('Answer 2')).toBeInTheDocument();
    expect(screen.getByText('覚えた')).toBeInTheDocument();
  });

  it('復習するボタンが描画されること', () => {
    expect(screen.getByText('復習する')).toBeInTheDocument();
  });

  it('ホームへ戻るボタンが描画されること', () => {
    expect(screen.getByText('ホームへ戻る')).toBeInTheDocument();
  });

  it('次へボタンが描画されること', () => {
    expect(screen.getByText('次の2個')).toBeInTheDocument();
  });
});

describe('ResultScreen 復習関連', () => {
  it('復習モードの場合、サブタイトルが「復習 NWords」になること', () => {
    const studySet: StudySet = {
      words: [
        { word: 'Word 1', quiz: { answer: 'Answer 1', options: ['option1', 'option2'] } },
        { word: 'Word 2', quiz: { answer: 'Answer 2', options: ['option1', 'option2'] } },
      ],
      quizzes: [
        new Quiz('Word 1', 2, ['option1', 'option2', 'Answer 1']),
        new Quiz('Word 2', 2, ['option1', 'option2', 'Answer 2']),
      ],
      studyMode: 'retry',
    };
    const studyResult: StudyResult = {
      userAnswers: [
        { option: 1, checked: true },
        { option: 2, checked: false },
      ],
      endOfReason: 'finish',
    };
    const wordStatus: Record<string, WordStatus> = {
      'Word 1': { word: 'Word 1', status: 1, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
      'Word 2': { word: 'Word 2', status: 6, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
    };
    const countOfNext = 2;
    const onUserButtonClick = jest.fn();


    render(
      <ResultScreen
        studySet={studySet}
        studyResult={studyResult}
        wordStatus={wordStatus}
        countOfNext={countOfNext}
        onUserButtonClick={onUserButtonClick}
      />
    );

    expect(screen.getByText('復習 2Words')).toBeInTheDocument();
  });

  test.each([
    [0, 0, 2, '描画される'],
    [0, 1, 1, '描画される'],
    [0, 2, 0, '描画される'],
    [1, 0, 1, '描画される'],
    [1, 1, 0, '描画される'],
    [2, 0, 0, '描画されない'],
  ])('正答チェック無%i, 正答チェック有%i, 誤答チェック有%i のときに復習ボタンが%sこと', (cn, cy, wy, description) => {
    const studySet: StudySet = {
      words: [
        { word: 'Word 1', quiz: { answer: 'Answer 1', options: ['option1', 'option2'] } },
        { word: 'Word 2', quiz: { answer: 'Answer 2', options: ['option1', 'option2'] } },
      ],
      quizzes: [
        new Quiz('Word 1', 2, ['option1', 'option2', 'Answer 1']),
        new Quiz('Word 2', 2, ['option1', 'option2', 'Answer 2']),
      ],
      studyMode: 'retry',
    };

    const studyResult: StudyResult = {
      userAnswers: [
        { option: cn + cy > 0 ? 2 : 1, checked: cy + wy > 0 },
        { option: cn + cy > 1 ? 2 : 1, checked: cy + wy > 1 },
      ],
      endOfReason: 'finish',
    };
    const wordStatus: Record<string, WordStatus> = {
      'Word 1': { word: 'Word 1', status: 1, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
      'Word 2': { word: 'Word 2', status: 6, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
    };
    const countOfNext = 2;
    const onUserButtonClick = jest.fn();


    render(
      <ResultScreen
        studySet={studySet}
        studyResult={studyResult}
        wordStatus={wordStatus}
        countOfNext={countOfNext}
        onUserButtonClick={onUserButtonClick}
      />
    );

    if (description === '描画される') {
      expect(screen.getByText('復習する')).toBeInTheDocument();
    } else {
      expect(screen.queryByText('復習する')).not.toBeInTheDocument();
    }
  });

  it('復習するボタンがクリックされた時にonUserButtonClickが呼ばれること', () => {
    const studySet: StudySet = {
      words: [
        { word: 'Word 1', quiz: { answer: 'Answer 1', options: ['option1', 'option2'] } },
        { word: 'Word 2', quiz: { answer: 'Answer 2', options: ['option1', 'option2'] } },
      ],
      quizzes: [
        new Quiz('Word 1', 2, ['option1', 'option2', 'Answer 1']),
        new Quiz('Word 2', 2, ['option1', 'option2', 'Answer 2']),
      ],
      studyMode: 'retry',
    };
    const studyResult: StudyResult = {
      userAnswers: [
        { option: 2, checked: true },
        { option: 1, checked: false },
      ],
      endOfReason: 'finish',
    };
    const wordStatus: Record<string, WordStatus> = {
      'Word 1': { word: 'Word 1', status: 1, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
      'Word 2': { word: 'Word 2', status: 6, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
    };
    const countOfNext = 2;
    const onUserButtonClick = jest.fn();


    render(
      <ResultScreen
        studySet={studySet}
        studyResult={studyResult}
        wordStatus={wordStatus}
        countOfNext={countOfNext}
        onUserButtonClick={onUserButtonClick}
      />
    );

    screen.getByText('復習する').click();
    expect(onUserButtonClick).toHaveBeenCalledTimes(1);
    expect(onUserButtonClick).toHaveBeenCalledWith('retry');

  });

});

describe('ResultScreen 学習結果表示関連', () => {
  it('正誤・スキップ総数が正しく描画されること', () => {
    const studySet: StudySet = {
      words: [
        { word: 'Word 1', quiz: { answer: 'Answer 1', options: ['option1', 'option2'] } },
        { word: 'Word 2', quiz: { answer: 'Answer 2', options: ['option1', 'option2'] } },
        { word: 'Word 3', quiz: { answer: 'Answer 3', options: ['option1', 'option2'] } },
        { word: 'Word 4', quiz: { answer: 'Answer 4', options: ['option1', 'option2'] } },
        { word: 'Word 5', quiz: { answer: 'Answer 5', options: ['option1', 'option2'] } },
        { word: 'Word 6', quiz: { answer: 'Answer 6', options: ['option1', 'option2'] } },
        { word: 'Word 7', quiz: { answer: 'Answer 7', options: ['option1', 'option2'] } },
        { word: 'Word 8', quiz: { answer: 'Answer 8', options: ['option1', 'option2'] } },
        { word: 'Word 9', quiz: { answer: 'Answer 9', options: ['option1', 'option2'] } },
        { word: 'Word 10', quiz: { answer: 'Answer 10', options: ['option1', 'option2'] } },
        { word: 'Word 11', quiz: { answer: 'Answer 11', options: ['option1', 'option2'] } },
        { word: 'Word 12', quiz: { answer: 'Answer 12', options: ['option1', 'option2'] } },
      ],
      quizzes: [
        new Quiz('Word 1', 1, ['option1', 'option2', 'Answer 1']),
        new Quiz('Word 2', 1, ['option1', 'option2', 'Answer 2']),
        new Quiz('Word 3', 1, ['option1', 'option2', 'Answer 3']),
        new Quiz('Word 4', 1, ['option1', 'option2', 'Answer 4']),
        new Quiz('Word 5', 1, ['option1', 'option2', 'Answer 5']),
        new Quiz('Word 6', 1, ['option1', 'option2', 'Answer 6']),
        new Quiz('Word 7', 1, ['option1', 'option2', 'Answer 7']),
        new Quiz('Word 8', 1, ['option1', 'option2', 'Answer 8']),
        new Quiz('Word 9', 1, ['option1', 'option2', 'Answer 9']),
        new Quiz('Word 10', 1, ['option1', 'option2', 'Answer 10']),
        new Quiz('Word 11', 1, ['option1', 'option2', 'Answer 11']),
        new Quiz('Word 12', 1, ['option1', 'option2', 'Answer 12']),
      ],
      studyMode: 'normal',
    };
    const studyResult: StudyResult = {
      userAnswers: [
        { option: 1, checked: false },
        { option: 1, checked: false },
        { option: 1, checked: false },
        { option: 1, checked: false },
        { option: 1, checked: false },
    
        { option: 2, checked: false },
        { option: 2, checked: false },
        { option: 2, checked: false },
        { option: 2, checked: false },
        { option: -1, checked: false },
    
        { option: -1, checked: false },
        { option: -1, checked: false },
      ],
      endOfReason: 'finish',
    };
    const wordStatus: Record<string, WordStatus> = {
      'Word 1': { word: 'Word 1', status: 1, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
      'Word 2': { word: 'Word 2', status: 6, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
      'Word 3': { word: 'Word 3', status: 1, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
      'Word 4': { word: 'Word 4', status: 1, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
      'Word 5': { word: 'Word 5', status: 1, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
      'Word 6': { word: 'Word 6', status: 1, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
      'Word 7': { word: 'Word 7', status: 1, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
      'Word 8': { word: 'Word 8', status: 1, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
      'Word 9': { word: 'Word 9', status: 1, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
      'Word 10': { word: 'Word 10', status: 1, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
      'Word 11': { word: 'Word 11', status: 1, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
      'Word 12': { word: 'Word 12', status: 1, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
    };
    const countOfNext = 2;
    const onUserButtonClick = jest.fn();

    render(
      <ResultScreen
        studySet={studySet}
        studyResult={studyResult}
        wordStatus={wordStatus}
        countOfNext={countOfNext}
        onUserButtonClick={onUserButtonClick}
      />
    );

    expect(screen.getByText(`○5 / ×4 / -3`)).toBeInTheDocument();
  });
});

describe('ResultScreen ホームへ戻る関連', () => {
  const studySet: StudySet = {
    words: [
      { word: 'Word 1', quiz: { answer: 'Answer 1', options: ['option1', 'option2'] } },
      { word: 'Word 2', quiz: { answer: 'Answer 2', options: ['option1', 'option2'] } },
    ],
    quizzes: [
      new Quiz('Word 1', 2, ['option1', 'option2', 'Answer 1']),
      new Quiz('Word 2', 2, ['option1', 'option2', 'Answer 2']),
    ],
    studyMode: 'normal',
  };
  const studyResult: StudyResult = {
    userAnswers: [
      { option: 1, checked: true },
      { option: 2, checked: false },
    ],
    endOfReason: 'finish',
  };
  const wordStatus: Record<string, WordStatus> = {
    'Word 1': { word: 'Word 1', status: 1, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
    'Word 2': { word: 'Word 2', status: 6, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
  };
  const countOfNext = 2;
  const onUserButtonClick = jest.fn();

  beforeEach(() => {
    render(
      <ResultScreen
        studySet={studySet}
        studyResult={studyResult}
        wordStatus={wordStatus}
        countOfNext={countOfNext}
        onUserButtonClick={onUserButtonClick}
      />
    );
  });

  it('ホームへ戻るボタンがクリックされた時にonUserButtonClickが呼ばれること', () => {
    screen.getByText('ホームへ戻る').click();
    expect(onUserButtonClick).toHaveBeenCalledTimes(1);
    expect(onUserButtonClick).toHaveBeenCalledWith('home');
  });
});

describe('ResultScreen 次へ関連', () => {
  const studySet: StudySet = {
    words: [
      { word: 'Word 1', quiz: { answer: 'Answer 1', options: ['option1', 'option2'] } },
      { word: 'Word 2', quiz: { answer: 'Answer 2', options: ['option1', 'option2'] } },
    ],
    quizzes: [
      new Quiz('Word 1', 2, ['option1', 'option2', 'Answer 1']),
      new Quiz('Word 2', 2, ['option1', 'option2', 'Answer 2']),
    ],
    studyMode: 'normal',
  };
  let userAnswers: UserAnswer[];
  let wordStatus: Record<string, WordStatus>;
  const onUserButtonClick = jest.fn();

  beforeEach(() => {
    wordStatus = {
      'Word 1': { word: 'Word 1', status: 1, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
      'Word 2': { word: 'Word 2', status: 6, lastLearnedDate: '2021-01-01T00:00:00', answerHistory: [] },
    };
  });

  it('次単語があり、終了理由が「完了」の場合には次のN個ボタンが表示される', () => {
    const studyResult: StudyResult = {
      userAnswers: [
        { option: 1, checked: true },
        { option: 2, checked: false },
      ],
      endOfReason: 'finish',
    };

    render(
      <ResultScreen
        studySet={studySet}
        studyResult={studyResult}
        wordStatus={wordStatus}
        countOfNext={2}
        onUserButtonClick={onUserButtonClick}
      />
    );

    const nextButton = screen.getByText('次の2個');
    expect(nextButton).toBeInTheDocument();
  });

  it('次単語があり、終了理由が「やめる」の場合には次のN個ボタンが表示されない', () => {
    const studyResult: StudyResult = {
      userAnswers: [
        { option: 1, checked: true },
        { option: 2, checked: false },
      ],
      endOfReason: 'quit',
    };

    render(
      <ResultScreen
        studySet={studySet}
        studyResult={studyResult}
        wordStatus={wordStatus}
        countOfNext={2}
        onUserButtonClick={onUserButtonClick}
      />
    );

    const nextButton = screen.queryByText('次の2個');
    expect(nextButton).toBeNull();
  });

  it('次単語がない場合には次のN語ボタンが表示されない', () => {
    const studyResult: StudyResult = {
      userAnswers: [
        { option: 1, checked: true },
        { option: 2, checked: false },
      ],
      endOfReason: 'finish',
    };

    render(
      <ResultScreen
        studySet={studySet}
        studyResult={studyResult}
        wordStatus={wordStatus}
        countOfNext={0}
        onUserButtonClick={onUserButtonClick}
      />
    );

    const nextButton = screen.queryByText('次の2個');
    expect(nextButton).toBeNull();
  });

  it('次のN語ボタンをクリックでコールバック呼出', () => {
    const studyResult: StudyResult = {
      userAnswers: [
        { option: 1, checked: true },
        { option: 2, checked: false },
      ],
      endOfReason: 'finish',
    };

    render(
      <ResultScreen
        studySet={studySet}
        studyResult={studyResult}
        wordStatus={wordStatus}
        countOfNext={2}
        onUserButtonClick={onUserButtonClick}
      />
    );

    const nextButton = screen.getByText('次の2個');
    nextButton.click();
    expect(onUserButtonClick).toHaveBeenCalledTimes(1);
    expect(onUserButtonClick).toHaveBeenCalledWith('next');
  });
});
