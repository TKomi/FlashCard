import { render, screen } from '@testing-library/react';
import App from './App';
import { test } from '@jest/globals';

test('renders learn react link', () => {
  render(<App />);
  const titleElement = screen.getByText(/単語帳/i);
  expect(titleElement).toBeInTheDocument();
});
