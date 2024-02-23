import { save } from './SaveLearningSession';
import { FlashCardData, LS } from './LS';
import { Quiz } from '../models/Quiz';
import { WordStatus } from '../models/WordStatus';

jest.mock('./LS', () => ({
  __esModule: true,
  LS: {
    save: jest.fn(),
  }
}));

describe('save', () => {

  const quizzes = [
    new Quiz('word1', 0, ['ans', 'opt1', 'opt2', 'opt3']),
    new Quiz('word2', 0, ['ans', 'opt1', 'opt2', 'opt3']),
    new Quiz('word3', 1, ['ans', 'opt1', 'opt2', 'opt3']),
  ];
  const userAnswers = [
    { option: 1, checked: false },
    { option: 0, checked: false },
    { option: 0, checked: false },
  ];
  const oldFlashCardData: FlashCardData = {
    learningSession: [],
    wordStatus: {},
    wordSetStatus: [],
  };
  const updatedWordsStatuses: WordStatus[] = [
    { word: 'word1', status: 1, lastLearnedDate: '', answerHistory: [] },
    { word: 'word2', status: 2, lastLearnedDate: '', answerHistory: [] },
    { word: 'word3', status: 3, lastLearnedDate: '', answerHistory: [] },
  ];
  const wordSetNo = 'TestWordSetNo';

  beforeEach(() => {
    (LS.save as jest.Mock).mockClear();
  });

  test('学習セッションの状況が正しく保存されること', () => {
    // Act
    const result = save(quizzes, userAnswers, oldFlashCardData, updatedWordsStatuses, wordSetNo);

    // Assert
    expect(result.learningSession).toHaveLength(1);
    expect(result.learningSession[0].sessionId).toBeDefined();
    expect(result.learningSession[0].wordSetNo).toBe(wordSetNo);
    expect(result.learningSession[0].completionDate).toBeDefined();
    expect(result.learningSession[0].answerHistory).toHaveLength(3);
    expect(result.learningSession[0].answerHistory[0].w).toBe('word1');
    expect(result.learningSession[0].answerHistory[0].c).toBe(false);
    expect(result.learningSession[0].answerHistory[1].w).toBe('word2');
    expect(result.learningSession[0].answerHistory[1].c).toBe(true);
    expect(result.learningSession[0].answerHistory[2].w).toBe('word3');
    expect(result.learningSession[0].answerHistory[2].c).toBe(false);
  });

  test('wordStatusが正しく更新されること', () => {
    // Act
    const result = save(quizzes, userAnswers, oldFlashCardData, updatedWordsStatuses, wordSetNo);

    // Assert
    expect(result.wordStatus).toHaveProperty('word1');
    expect(result.wordStatus.word1).toEqual({ word: 'word1', status: 1,  lastLearnedDate: '', answerHistory: [] });
    expect(result.wordStatus).toHaveProperty('word2');
    expect(result.wordStatus.word2).toEqual({ word: 'word2', status: 2,  lastLearnedDate: '', answerHistory: [] });
    expect(result.wordStatus).toHaveProperty('word3');
    expect(result.wordStatus.word3).toEqual({ word: 'word3', status: 3,  lastLearnedDate: '', answerHistory: [] });
  });

  test('wordSetStatusが正しく更新されること', () => {
    // Act
    const result = save(quizzes, userAnswers, oldFlashCardData, updatedWordsStatuses, wordSetNo);

    // Assert
    expect(result.wordSetStatus).toHaveLength(1);
    expect(result.wordSetStatus[0].wordSetNo).toBe(1);
    expect(result.wordSetStatus[0].groupsAndCounts.group0).toBe(0);
    expect(result.wordSetStatus[0].groupsAndCounts.group1).toBe(2);
    expect(result.wordSetStatus[0].groupsAndCounts.group2).toBe(1);
    expect(result.wordSetStatus[0].groupsAndCounts.group3).toBe(0);
    expect(result.wordSetStatus[0].learningCount).toBe(1);
  });

  test('LocalStorageにデータが保存されること', () => {
    // Act
    const actual = save(quizzes, userAnswers, oldFlashCardData, updatedWordsStatuses, wordSetNo);

    // Assert
    expect(LS.save).toHaveBeenCalledWith({
      learningSession: expect.any(Array),
      wordStatus: expect.any(Object),
      wordSetStatus: expect.any(Array),
    });

    expect(actual.learningSession[0].wordSetNo).toBe(wordSetNo);
  });

  test('保存されたデータが返されること', () => {
    // Act
    const result = save(quizzes, userAnswers, oldFlashCardData, updatedWordsStatuses, wordSetNo);

    // Assert
    expect(result).toEqual({
      learningSession: expect.any(Array),
      wordStatus: expect.any(Object),
      wordSetStatus: expect.any(Array),
    });
  });
});