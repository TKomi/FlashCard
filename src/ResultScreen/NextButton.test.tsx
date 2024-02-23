import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextButton } from './NextButton';

describe('NextButton', () => {
  const onUserButtonClick = jest.fn();

  it('countOfNextが0の場合、ボタンが表示されないこと', () => {
    render(<NextButton countOfNext={0} onUserButtonClick={onUserButtonClick} quitted={false} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('quittedがtrueの場合、ボタンが表示されないこと', () => {
    render(<NextButton countOfNext={5} onUserButtonClick={onUserButtonClick} quitted={true} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('countOfNext>=0かつquittedがfalseのとき、ボタンが表示されること', () => {
    render(<NextButton countOfNext={5} onUserButtonClick={onUserButtonClick} quitted={false} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('ボタンクリック時にonUserButtonClickが呼ばれること', () => {
    render(<NextButton countOfNext={5} onUserButtonClick={onUserButtonClick} quitted={false} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onUserButtonClick).toHaveBeenCalledTimes(1);
    expect(onUserButtonClick).toHaveBeenCalledWith('next');
  });
});