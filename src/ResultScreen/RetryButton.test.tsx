import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { RetryButton } from './RetryButton';

describe('RetryButton', () => {
  const onUserButtonClick = jest.fn();

  it('countOfRetryが0の場合、スペーサーが表示されること', () => {
    render(<RetryButton countOfRetry={0} onUserButtonClick={onUserButtonClick} />);
    expect(screen.queryByText('復習する')).toBeNull();
    expect(screen.getByTestId('spacer')).toBeInTheDocument();
  });

  it('countOfRetryが0以外の場合、ボタンが表示されること', () => {
    render(<RetryButton countOfRetry={5} onUserButtonClick={onUserButtonClick} />);
    expect(screen.getByText('復習する')).toBeInTheDocument();
    expect(screen.queryByTestId('spacer')).toBeNull();
  });

  it('ボタンクリック時にonUserButtonClickが呼ばれること', () => {
    render(<RetryButton countOfRetry={5} onUserButtonClick={onUserButtonClick} />);
    fireEvent.click(screen.getByText('復習する'));
    expect(onUserButtonClick).toHaveBeenCalledTimes(1);
    expect(onUserButtonClick).toHaveBeenCalledWith('retry');
  });
});