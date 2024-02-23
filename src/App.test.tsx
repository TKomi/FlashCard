jest.mock('./store/LS', () => {
  return {
    // export {} をモック化
    __esModule: true,
    LS: {
      save: jest.fn(),
      loadOrDefault: jest.fn(() => ({
        learningSession: [],
        wordStatus: {
          "word1": {
            status: 1,
            answerHistory: [],
          },
          "word2": {
            status: 1,
            answerHistory: [],
          }
        },
        wordSetStatus: [],
      })),
    },
    getInitialState: jest.fn(() => ({
      learningSession: [],
      wordStatus: {},
      wordSetStatus: [],
    })),
  };
});

jest.mock('./HomeScreen/HomeScreen.tsx', () => {
  return {
    __esModule: true,
    HomeScreen: jest.fn(() => <div>HomeScreen</div>),
  };
})

jest.mock('./StudyScreen/StudyScreen.tsx', () => {
  return {
    __esModule: true,
    StudyScreen: jest.fn(() => <div>StudyScreen</div>),
  };
});

jest.mock('./ResultScreen/ResultScreen.tsx', () => {
  return {
    __esModule: true,
    ResultScreen: jest.fn(() => <div>ResultScreen</div>),
  };
});

jest.mock('./StudyScreen/CreateQuiz.ts', () => {
  return {
    __esModule: true,
    createQuiz4: jest.fn((word) => ({
      question: word.word,
      answerIndex: 0,
      options: [
        "ans1",
        "opt11",
        "opt12",
        "opt13"
      ]
    })),
  };
});

const datasetMock = {
  "dataSet": [
    {
      "seriesNo": 1,
      "seriesName": "Sample",
      "seriesDescription": "Sample Dataset 100語からの出題です。",
      "size": 100,
      "wordSets": [
        {
          "wordSetNo": "1",
          "wordSetName": "Part1",
          "filePath": "sample/part1.json",
          "size": 50
        },
        {
          "wordSetNo": "2",
          "wordSetName": "Part2",
          "filePath": "sample/part2.json",
          "size": 50
        },
      ]
    }
  ]
};

const part1Mock = [
  {
    word: "word1",
    quiz: {
      answer: "ans1",
      options: [
        "opt11",
        "opt12",
        "opt13"
      ]
    }
  },
  {
    word: "word2",
    quiz: {
      answer: "ans2",
      options: [
        "opt21",
        "opt22",
        "opt23"
      ]
    }
  },
];

jest.mock('./models/WordSetIndex.ts', () => ({
  __esModule: true,
  WordSetIndexUtil: {
    loadFromIndexJson: jest.fn(() => Promise.resolve(datasetMock)),
  },
}));

jest.mock('./store/WordSetUtils.ts', () => {
  return {
    __esModule: true,
    extractFromWords: jest.fn((arg0, _arg1, _arg2) => arg0),
    loadFromWordJson: jest.fn().mockReturnValue(Promise.resolve(part1Mock)),
    getShuffledArray: jest.fn((arg) => arg),
  };
});


import { act, render, screen, waitFor } from '@testing-library/react';
import { LS as LSMock } from './store/LS.ts';
import { HomeScreen as HomeScreenMock } from './HomeScreen/HomeScreen.tsx';
import { StudyScreen as StudyScreenMock } from './StudyScreen/StudyScreen.tsx';
import { ResultScreen as ResultScreenMock } from './ResultScreen/ResultScreen.tsx';
import { Series, WordSetIndexUtil as WordSetIndexUtilMock } from './models/WordSetIndex.ts';
import { loadFromWordJson as loadFromWordJsonMock } from './store/WordSetUtils.ts';
import App from './App';
import { test } from '@jest/globals';

// 表示項目の過不足等は、コンポーネントのテストで行う
// 子コンポーネントはモックする

beforeEach(async () => {

  // render時に内部で非同期処理を行っているため、renderを待つためにawait actを使う
  await act(async () => {
    render(<App />);
  })

});

afterEach(() => {
  // jest.resetAllMocks(); するとESModulesのモックがリセットされてしまうため、中身を個別にリセットする
  const mockClearTarget = [
    LSMock.save,
    LSMock.loadOrDefault,
    HomeScreenMock,
    StudyScreenMock,
    ResultScreenMock,
    WordSetIndexUtilMock.loadFromIndexJson,
    loadFromWordJsonMock,
  ];
  
  for (const m of mockClearTarget) {
    (m as jest.Mock).mockClear();
  }
});

test('起動時にホーム画面が表示されること', async () => {
  const titleMock = screen.getByText(/HomeScreen/i);
  expect(titleMock).toBeInTheDocument();
  expect((LSMock.loadOrDefault as jest.Mock)).toHaveBeenCalled();
});

test('起動時にJSONデータが読み込まれること', async () => {
  expect((WordSetIndexUtilMock.loadFromIndexJson as jest.Mock)).toHaveBeenCalledTimes(1);
});

test('起動時にLocalStorageからデータが読み込まれること', async () => {
  expect((LSMock.loadOrDefault as jest.Mock)).toHaveBeenCalled();
});

test('起動時に学習シリーズの一覧がホーム画面に渡ること', async() => {
  // dataSetのseriesNameを取得
  const actual1: string[][] = (HomeScreenMock as jest.Mock).mock.calls
    .map((call: any) => call[0]) // 各呼び出しの第1引数 = props
    .map((arg: any) => arg.seriesSet ?? []) // seriesSetがあればそれを返す
    .map((seriesSet: any) => seriesSet.dataSet ?? []) // dataSetがあればそれを返す
    .map((dataSet: any) => dataSet.map((s: any) => s.seriesName)); // seriesNameを取得
  expect(actual1).toContainEqual(['Sample']);

});

test('ホーム画面で単語セットを選択した時に学習画面が表示されること', async () => {
  // ホーム画面に渡っているコールバックを呼び出す
  const callback: (_filePath: string) => void = (HomeScreenMock as jest.Mock).mock.calls[0][0].onSelectedWordSet;
  await act(async () => {
    callback('sample/part2.json');
  });

  await waitFor(() => {
    expect(screen.getByText(/StudyScreen/i)).toBeInTheDocument();
  });

});

test('ホーム画面で単語セットを選択した時にJSONデータが読み込まれること', async () => {
  // ホーム画面に渡っているコールバックを呼び出す
  const callback: (_filePath: string) => void = (HomeScreenMock as jest.Mock).mock.calls[0][0].onSelectedWordSet;
  await act(async () => {
    callback('sample/part2.json');
  });

  await waitFor(() => {
    expect((loadFromWordJsonMock as jest.Mock)).toHaveBeenCalledTimes(1);
  });
});

test('問題が正常終了した時に結果画面が表示され、データ保存すること', async () => {
  // ホーム画面に渡っているコールバックを呼び出して、学習画面を表示する
  const callback1: (_series: Series, _filePath: string) => void = (HomeScreenMock as jest.Mock).mock.calls[0][0].onSelectedWordSet;
  await act(async () => {
    callback1(datasetMock.dataSet[0], 'sample/part2.json');
  });

  // StudyScreenに渡っているコールバックを呼び出す
  const callback2: (_ua: any) => void = (StudyScreenMock as jest.Mock).mock.calls[0][0].onEndQuiz;
  await act(async () => {
    callback2([
      { option: 1, checked: false, },
      { option: 1, checked: false, },
    ]);
  });

  // 結果画面が表示されることを確認
  await waitFor(() => {
    expect(screen.getByText(/ResultScreen/i)).toBeInTheDocument();
  });

  // Propsが正しく渡されていることを確認
  const actual: any = (ResultScreenMock as jest.Mock).mock.calls[0][0];
  expect(actual.studySet.words).toEqual(part1Mock);
  expect(actual.studySet.quizzes.map((q: { question: any; }) => q.question)).toContain('word1');
  expect(actual.studySet.quizzes.map((q: { question: any; }) => q.question)).toContain('word2');
  expect(actual.studyResult.userAnswers).toEqual([
    { option: 1, checked: false, },
    { option: 1, checked: false, },
  ]);
  expect(actual.wordStatus["word1"].status).toBe(1);
  expect(actual.wordStatus["word2"].status).toBe(1);

  // データが保存されることを確認
  expect((LSMock.save as jest.Mock)).toHaveBeenCalledTimes(1);
  expect(Object.keys((LSMock.save as jest.Mock).mock.calls[0][0].wordStatus)).not.toContain(undefined);
});

test('問題が1問以上解いて中断された時に結果画面が表示され、データ保存すること', async () => {
  // ホーム画面に渡っているコールバックを呼び出して、学習画面を表示する
  const callback1: (_series: Series, _filePath: string) => void = (HomeScreenMock as jest.Mock).mock.calls[0][0].onSelectedWordSet;
  await act(async () => {
    callback1(datasetMock.dataSet[0], 'sample/part2.json');
  });

  // StudyScreenに渡っているコールバックを呼び出す
  const callback2: (_ua: any) => void = (StudyScreenMock as jest.Mock).mock.calls[0][0].onEndQuiz;
  await act(async () => {
    callback2([
      { option: 1, checked: false, },
    ]);
  });

  // 結果画面が表示されることを確認
  await waitFor(() => {
    expect(screen.getByText(/ResultScreen/i)).toBeInTheDocument();
  });

  // データが保存されることを確認
  expect((LSMock.save as jest.Mock)).toHaveBeenCalledTimes(1);

});

test('問題が1問も解かれずに中断された時に結果画面が表示されずホームに戻ること', async () => {
  // ホーム画面に渡っているコールバックを呼び出して、学習画面を表示する
  const callback1: (_series: Series, _filePath: string) => void = (HomeScreenMock as jest.Mock).mock.calls[0][0].onSelectedWordSet;
  await act(async () => {
    callback1(datasetMock.dataSet[0], 'sample/part2.json');
  });

  // StudyScreenに渡っているコールバックを呼び出す
  const callback2: (_ua: any) => void = (StudyScreenMock as jest.Mock).mock.calls[0][0].onEndQuiz;
  await act(async () => {
    callback2([]); // 1問も解かれずに中断
  });

  // 結果画面が表示されずホーム画面に遷移していることを確認
  await waitFor(() => {
    expect(screen.queryByText(/ResultScreen/i)).not.toBeInTheDocument();
    expect(screen.getByText(/HomeScreen/i)).toBeInTheDocument();
  });

  // データが保存されていないことを確認
  expect((LSMock.save as jest.Mock)).not.toHaveBeenCalled();
});

test('結果画面でホーム画面に戻るを選択時にホーム画面が表示されること', async () => {
  // ホーム画面に渡っているコールバックを呼び出して、学習画面を表示する
  const callback1: (_series: Series, _filePath: string) => void = (HomeScreenMock as jest.Mock).mock.calls[0][0].onSelectedWordSet;
  await act(async () => {
    callback1(datasetMock.dataSet[0], 'sample/part2.json');
  });

  // StudyScreenに渡っているコールバックを呼び出す
  const callback2: (_ua: any) => void = (StudyScreenMock as jest.Mock).mock.calls[0][0].onEndQuiz;
  await act(async () => {
    callback2([
      { option: 1, checked: false, },
      { option: 1, checked: false, },
    ]);
  });

  // ResultScreenに渡っているコールバックを呼び出す
  const callback3: (_name: string) => void = (ResultScreenMock as jest.Mock).mock.calls[0][0].onUserButtonClick;
  await act(async () => {
    callback3('home');
  });

  // ホーム画面が表示されることを確認
  await waitFor(() => {
    expect(screen.getByText(/HomeScreen/i)).toBeInTheDocument();
  });
});

test('結果画面で復習ボタンを選択時に学習画面へ遷移すること', async () => {
  // ホーム画面に渡っているコールバックを呼び出して、学習画面を表示する
  const callback1: (_series: Series, _filePath: string) => void = (HomeScreenMock as jest.Mock).mock.calls[0][0].onSelectedWordSet;
  await act(async () => {
    callback1(datasetMock.dataSet[0], 'sample/part2.json');
  });

  // StudyScreenに渡っているコールバックを呼び出す
  const callback2: (_ua: any) => void = (StudyScreenMock as jest.Mock).mock.calls[0][0].onEndQuiz;
  await act(async () => {
    callback2([
      { option: 1, checked: false, },
      { option: 1, checked: false, },
    ]);
  });

  // ResultScreenに渡っているコールバックを呼び出す
  const callback3: (_name: string) => void = (ResultScreenMock as jest.Mock).mock.calls[0][0].onUserButtonClick;
  await act(async () => {
    callback3('retry');
  });

  // 学習画面が表示されることを確認
  await waitFor(() => {
    expect(screen.getByText(/StudyScreen/i)).toBeInTheDocument();
  });

});

test('結果画面で次のn個へ進むボタンを選択時に学習画面へ遷移すること', async () => {
  // ホーム画面に渡っているコールバックを呼び出して、学習画面を表示する
  const callback1: (_series: Series, _filePath: string) => void = (HomeScreenMock as jest.Mock).mock.calls[0][0].onSelectedWordSet;
  await act(async () => {
    callback1(datasetMock.dataSet[0], 'sample/part2.json');
  });

  // StudyScreenに渡っているコールバックを呼び出す
  const callback2: (_ua: any) => void = (StudyScreenMock as jest.Mock).mock.calls[0][0].onEndQuiz;
  await act(async () => {
    callback2([
      { option: 1, checked: false, },
      { option: 1, checked: false, },
    ]);
  });

  // ResultScreenに渡っているコールバックを呼び出す
  const callback3: (_name: string) => void = (ResultScreenMock as jest.Mock).mock.calls[0][0].onUserButtonClick;
  await act(async () => {
    callback3('next');
  });

  // 学習画面が表示されることを確認
  await waitFor(() => {
    expect(screen.getByText(/StudyScreen/i)).toBeInTheDocument();
  });
});