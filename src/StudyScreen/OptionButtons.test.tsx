import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OptionButtons } from './OptionButtons';
import { Quiz } from '../models/Quiz';

describe('OptionButtons', () => {
  const quiz = new Quiz('Question', 0, ['Option 1', 'Option 2', 'Option 3', 'Option 4']);

  const onAnswer = jest.fn();
  const onNextQuiz = jest.fn();
  const onQuit = jest.fn();

  beforeEach(() => {
    render(
      <OptionButtons
        quiz={quiz}
        onAnswer={onAnswer}
        onNextQuiz={onNextQuiz}
        onQuit={onQuit}
      />
    );
  });

  it('ボタンが描画されること', () => {
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
    expect(screen.getByText('Option 4')).toBeInTheDocument();
  });

  it('回答ボタンがクリックされた時にonAnswerが呼ばれること', () => {
    fireEvent.click(screen.getByText('Option 1'));
    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith({ option: 0, checked: false });
  });

  it('スキップボタンがクリックされた時にonAnswerが呼ばれること', () => {
    fireEvent.click(screen.getByText('スキップ'));
    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith({ option: -1, checked: false });
  });

  it('やめるボタンがクリックされた時にonQuitが呼ばれること', () => {
    fireEvent.click(screen.getByText('やめる'));
    expect(onQuit).toHaveBeenCalledTimes(1);
  });

  it('回答後、スタイルが変更されること', async () => {
    fireEvent.click(screen.getByText('Option 2'));
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toHaveClass('actual');
      expect(screen.getByText('Option 2')).toHaveClass('incorrect');
      expect(screen.getByText('Option 3')).toHaveClass('default');
      expect(screen.getByText('Option 4')).toHaveClass('default');
    });
  });

  it('スキップ後、スタイルが変更されること', async () => {
    fireEvent.click(screen.getByText('スキップ'));
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toHaveClass('actual');
      expect(screen.getByText('Option 2')).toHaveClass('default');
      expect(screen.getByText('Option 3')).toHaveClass('default');
      expect(screen.getByText('Option 4')).toHaveClass('default');
      expect(screen.getByText('スキップ')).toHaveClass('incorrect');
    });
  });
});