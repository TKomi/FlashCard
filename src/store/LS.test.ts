import { FlashCardData, LS, getInitialState } from './LS';
import Schema from './ls.schema.json';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('LS', () => {
  afterEach(() => {
    localStorageMock.clear();
  });

  test('save: データがLocalStorageに保存されること', () => {
    // Arrange
    const saveTarget: FlashCardData = {
      learningSession: [],
      wordStatus: {},
      wordSetStatus: [],
    };

    // Act
    LS.save(saveTarget);

    // Assert
    const expected = { ...saveTarget, databaseVersion: Schema.description};
    expect(localStorageMock.setItem).toHaveBeenCalledWith('flashCard', JSON.stringify(expected));
  });

  test('loadOrDefault: データがLocalStorageから読み込まれること', () => {
    // Arrange
    const data: FlashCardData = {
      learningSession: [],
      wordStatus: {},
      wordSetStatus: [],
    };
    localStorageMock.setItem('flashCard', JSON.stringify(data));

    // Act
    const result = LS.loadOrDefault();

    // Assert
    expect(result).toEqual(data);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('flashCard');
  });

  test('loadOrDefault: データがLocalStorageに存在しない場合に初期値が返されること', () => {
    // Act
    const result = LS.loadOrDefault();

    // Assert
    expect(result).toEqual({
      databaseVersion: Schema.description,
      learningSession: [],
      wordStatus: {},
      wordSetStatus: [],
    });
  });

  test('loadOrDefault: wordStatusにデータが存在する場合に戻り値のwordStatusが正しく設定されていること', () => {
    // Arrange
    const data: FlashCardData = {
      learningSession: [],
      wordStatus: {
        word1: {
          word: 'word1',
          status: 1,
          lastLearnedDate: '',
          answerHistory: [],
        },
      },
      wordSetStatus: [],
    };
    localStorageMock.setItem('flashCard', JSON.stringify(data));

    // Act
    const result = LS.loadOrDefault();

    // Assert
    expect(result.wordStatus).toEqual(data.wordStatus);
  })
});

describe('getInitialState', () => {
  test('getInitialState: 毎回異なる値を返していること', () => {
    // Act
    const result = getInitialState();
    const result2 = getInitialState();

    // Assert
    // オブジェクトが同じでないことを確認
    expect(result).not.toBe(result2);
  });

})