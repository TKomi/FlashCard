import { render, screen } from '@testing-library/react';
import { ResultStatus } from './ResultStatus';

describe('ResultStatus', () => {
  test.each([
    [6, '覚えた'],
    [5, '覚えた'],
    [4, 'うろ覚え'],
    [3, 'うろ覚え'],
    [2, '苦手'],
    [1, '苦手'],
    [0, '未学習'],
  ])('wordStatusが%iの場合に%sが描画されること', (status, text) => {
    render(<ResultStatus wordStatus={status as 0|1|2|3|4|5|6} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });
});