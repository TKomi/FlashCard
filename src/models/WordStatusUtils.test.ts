import { FlashCardData } from '../store/LS';
import { Quiz } from './Quiz';
import { updateWordStatuses } from './WordStatusUtils';

describe('updateWordStatuses', () => {
  let saveData: FlashCardData;
  let quizzes: Quiz[];

  beforeEach(() => {
    saveData = {
      wordStatus: {
        Word1: {
          word: 'Word1',
          lastLearnedDate: '2022-01-01T00:00:00.000Z',
          answerHistory: [],
          status: 1,
        },
        Word2: {
          word: 'Word2',
          lastLearnedDate: '2022-01-01T00:00:00.000Z',
          answerHistory: [],
          status: 2,
        },
        Word3: {
          word: 'Word3',
          lastLearnedDate: '2022-01-01T00:00:00.000Z',
          answerHistory: [],
          status: 3,
        },
        Word4: {
          word: 'Word4',
          lastLearnedDate: '2022-01-01T00:00:00.000Z',
          answerHistory: [],
          status: 4,
        },
        Word5: {
          word: 'Word5',
          lastLearnedDate: '2022-01-01T00:00:00.000Z',
          answerHistory: [],
          status: 5,
        },
        Word6: {
          word: 'Word6',
          lastLearnedDate: '2022-01-01T00:00:00.000Z',
          answerHistory: [],
          status: 6,
        },
        Word7: {
          word: 'Word7',
          lastLearnedDate: '2022-01-01T00:00:00.000Z',
          answerHistory: [],
          status: 0,
        },
      },
      learningSession: [],
      wordSetStatus: []
    };
    quizzes = [
      new Quiz('Word1', 0, ['q10', 'q11', 'q12']),
      new Quiz('Word2', 0, ['q20', 'q21', 'q22']),
      new Quiz('Word3', 0, ['q30', 'q31', 'q32']),
      new Quiz('Word4', 0, ['q40', 'q41', 'q42']),
      new Quiz('Word5', 0, ['q50', 'q51', 'q52']),
      new Quiz('Word6', 0, ['q60', 'q61', 'q62']),
      new Quiz('Word7', 0, ['q70', 'q71', 'q72']),
      new Quiz('Word8', 0, ['q80', 'q81', 'q82']),
    ];

  });


  test.each([
    [7, null, 5],
    [6, 0, 5],
    [0, 1, 2],
    [1, 2, 3],
    [2, 3, 4],
    [3, 4, 5],
    [4, 5, 6],
    [5, 6, 6],
  ])('%s: 正解 チェック無し もとのステータスが%i のステータス更新が正常に行われること', (index, _oldStatus, expectedStatus) => {
    // Arrange
    const userAnswers = [
      { option: 0, checked: false },
      { option: 0, checked: false },
      { option: 0, checked: false },
      { option: 0, checked: false },
      { option: 0, checked: false },
      { option: 0, checked: false },
      { option: 0, checked: false },
      { option: 0, checked: false },
    ];

    // Act
    const result = updateWordStatuses(quizzes, userAnswers, saveData);
    
    // Assert
    expect(result[index].status).toEqual(expectedStatus);
  });

  test.each([
    [7, null, 4],
    [6, 0, 4],
    [0, 1, 1],
    [1, 2, 2],
    [2, 3, 3],
    [3, 4, 4],
    [4, 5, 5],
    [5, 6, 6],
  ])('%s: 正解 チェックあり もとのステータスが%i のステータス更新が正常に行われること', (index, _oldStatus, expectedStatus) => {
    // Arrange
    const userAnswers = [
      { option: 0, checked: true },
      { option: 0, checked: true },
      { option: 0, checked: true },
      { option: 0, checked: true },
      { option: 0, checked: true },
      { option: 0, checked: true },
      { option: 0, checked: true },
      { option: 0, checked: true },
    ];

    // Act
    const result = updateWordStatuses(quizzes, userAnswers, saveData);

    // Assert
    expect(result[index].status).toEqual(expectedStatus);

  });


  test.each([
    [7, null, 3],
    [6, 0, 3],
    [0, 1, 1],
    [1, 2, 1],
    [2, 3, 2],
    [3, 4, 3],
    [4, 5, 4],
    [5, 6, 5],
  ])('%s: 不正解 チェック無し もとのステータスが%i のステータス更新が正常に行われること', (index, _oldStatus, expectedStatus) => {
    // Arrange
    const userAnswers = [
      { option: 1, checked: false },
      { option: 1, checked: false },
      { option: 1, checked: false },
      { option: 1, checked: false },
      { option: 1, checked: false },
      { option: 1, checked: false },
      { option: 1, checked: false },
      { option: 1, checked: false },
    ];

    // Act
    const result = updateWordStatuses(quizzes, userAnswers, saveData);

    // Assert
    expect(result[index].status).toEqual(expectedStatus);

  });

  test.each([
    [7, null, 2],
    [6, 0, 2],
    [0, 1, 1],
    [1, 2, 1],
    [2, 3, 2],
    [3, 4, 3],
    [4, 5, 4],
    [5, 6, 5],
  ])('%s: 不正解 チェックあり もとのステータスが%i のステータス更新が正常に行われること', (index, _oldStatus, expectedStatus) => {
    // Arrange
    const userAnswers = [
      { option: 1, checked: true },
      { option: 1, checked: true },
      { option: 1, checked: true },
      { option: 1, checked: true },
      { option: 1, checked: true },
      { option: 1, checked: true },
      { option: 1, checked: true },
      { option: 1, checked: true },
    ];

    // Act
    const result = updateWordStatuses(quizzes, userAnswers, saveData);

    // Assert
    expect(result[index].status).toEqual(expectedStatus);

  });
});