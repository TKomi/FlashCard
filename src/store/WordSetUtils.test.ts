import { loadFromWordJson, extractFromWords, getShuffledArray } from './WordSetUtils.ts';
import { Word } from '../models/Word.ts';
import { WordStatus } from '../models/WordStatus.ts';
import { WordSetIndex } from '../models/WordSetIndex.ts';

describe('loadFromWordJson', () => {
  test('JSONファイルから単語データを読み込むこと', async () => {
    // Arrange
    const index: WordSetIndex = {
      wordSetNo: '1',
      wordSetName: 'WordSet1',
      filePath: 'wordlist.json',
      size: 3,
    };
    const expectedWords = [
      { word: 'Word1', quiz: { answer: 'A1', options: ['Opt11', 'Opt12'] } },
      { word: 'Word2', quiz: { answer: 'A2', options: ['Opt21', 'Opt22'] } },
      { word: 'Word3', quiz: { answer: 'A3', options: ['Opt31', 'Opt32'] } },
    ];

    // Mock fetch function
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(expectedWords),
    });

    // Act
    const result = await loadFromWordJson(index);

    // Assert
    expect(result).toEqual(expectedWords);
    expect(fetch).toHaveBeenCalledWith('data/' + index.filePath);
  });
});

describe('extractFromsList', () => {
  test.each([
    // ランダム要素が絡むので全ての数字ではテストしない
    0, 3, 5, 7
  ])('規則に従ってWordsから単語を抽出し返すこと: num=%i', (num: number) => {
    // Arrange
    const words: Word[] = [
      { word: 'Word4', quiz: { answer: 'A4', options: ['Opt41', 'Opt42'] } },
      { word: 'Word2', quiz: { answer: 'A2', options: ['Opt21', 'Opt22'] } },
      { word: 'Word0', quiz: { answer: 'A0', options: ['Opt01', 'Opt02'] } },
      { word: 'Word1', quiz: { answer: 'A1', options: ['Opt11', 'Opt12'] } },
      { word: 'Word5', quiz: { answer: 'A5', options: ['Opt51', 'Opt52'] } },
      { word: 'Word3', quiz: { answer: 'A3', options: ['Opt31', 'Opt32'] } },
      { word: 'Word6', quiz: { answer: 'A6', options: ['Opt61', 'Opt62'] } },
    ];
    const allWordStatus: Record<string, WordStatus> = {
      Word1: { status: 1, word: 'Word1', lastLearnedDate: '', answerHistory: [] },
      Word2: { status: 2, word: 'Word2', lastLearnedDate: '', answerHistory: [] },
      Word3: { status: 3, word: 'Word3', lastLearnedDate: '', answerHistory: [] },
      Word4: { status: 4, word: 'Word4', lastLearnedDate: '', answerHistory: [] },
      Word5: { status: 5, word: 'Word5', lastLearnedDate: '', answerHistory: [] },
      Word6: { status: 6, word: 'Word6', lastLearnedDate: '', answerHistory: [] },
    };
    const expectedExtractedWords: Word[] = [
      { word: 'Word0', quiz: { answer: 'A0', options: ['Opt01', 'Opt02'] } },
      { word: 'Word1', quiz: { answer: 'A1', options: ['Opt11', 'Opt12'] } },
      { word: 'Word2', quiz: { answer: 'A2', options: ['Opt21', 'Opt22'] } },
      { word: 'Word3', quiz: { answer: 'A3', options: ['Opt31', 'Opt32'] } },
      { word: 'Word4', quiz: { answer: 'A4', options: ['Opt41', 'Opt42'] } },
      { word: 'Word5', quiz: { answer: 'A5', options: ['Opt51', 'Opt52'] } },
      { word: 'Word6', quiz: { answer: 'A6', options: ['Opt61', 'Opt62'] } },
    ];

    // Act
    const result = extractFromWords(words, num, allWordStatus);

    // Assert
    expect(result).toHaveLength(num);

    for(let i = 0; i < num; i++) {
      expect(result).toContainEqual(expectedExtractedWords[i]);
    }
  });
});

describe('getShuffledArray', () => {
  test('配列をシャッフルできていること', () => {
    // Arrange
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Act
    const result = getShuffledArray(array);

    // Assert
    expect(result).not.toEqual(array); // 確率で失敗する(同じになる) arrayのサイズを増やして確率をコントロール
    expect(result).toHaveLength(array.length);
    expect(result).toContain(1);
    expect(result).toContain(2);
    expect(result).toContain(3);
    expect(result).toContain(4);
    expect(result).toContain(5);
    expect(result).toContain(6);
    expect(result).toContain(7);
    expect(result).toContain(8);
    expect(result).toContain(9);
    expect(result).toContain(10);
  });
});