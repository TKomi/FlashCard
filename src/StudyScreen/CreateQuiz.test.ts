import { createQuiz4 } from './CreateQuiz';

describe('createQuiz4', () => {
  test('Wordから正しく問題作成できること', () => {
    // Arrange
    const word = {
      word: 'example',
      quiz: {
        answer: 'correct',
        options: ['option1', 'option2', 'option3'],
      },
    };

    // Act
    const quiz = createQuiz4(word);

    // Assert
    expect(quiz.question).toBe(word.word);
    expect(quiz.answerIndex).toBeGreaterThanOrEqual(0);
    expect(quiz.answerIndex).toBeLessThan(4);
    expect(quiz.options.length).toBe(4);
    expect(quiz.options[quiz.answerIndex]).toBe(word.quiz.answer);
    expect(quiz.options.filter((option) => option === word.quiz.options[0]).length).toBe(1);
    expect(quiz.options.filter((option) => option === word.quiz.options[1]).length).toBe(1);
    expect(quiz.options.filter((option) => option === word.quiz.options[2]).length).toBe(1);
  });
});