import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomeScreen } from './HomeScreen';
import { Series } from './models/WordSetIndex';

describe('HomeScreen', () => {
  const seriesSet: Series[] = [
    {
      seriesNo: 1,
      size: 2,
      seriesName: 'Series 1',
      seriesDescription: 'Description 1',
      wordSets: [
        {
          wordSetNo: '1',
          wordSetName: 'Word Set 1',
          size: 10,
          filePath: '/path/to/wordset1',
        },
        {
          wordSetNo: '2',
          wordSetName: 'Word Set 2',
          size: 20,
          filePath: '/path/to/wordset2',
        },
      ],
    },
    {
      seriesName: 'Series 2',
      seriesNo: 2,
      size: 2,
      seriesDescription: 'Description 2',
      wordSets: [
        {
          wordSetNo: '1',
          wordSetName: 'Word Set 3',
          size: 15,
          filePath: '/path/to/wordset3',
        },
        {
          wordSetNo: '2',
          wordSetName: 'Word Set 4',
          size: 25,
          filePath: '/path/to/wordset4',
        },
      ],
    },
  ];

  const onSelectedWordSet = jest.fn();

  beforeEach(() => {
    render(
      <HomeScreen
        seriesSet={seriesSet}
        wordSetStatus={[]}
        onSelectedWordSet={onSelectedWordSet}
      />
    );
  });

  it('シリーズ名と説明が描画されること', () => {
    expect(screen.getByText('Series 1')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Series 2')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  it('シリーズ名と単語数が描画されること', () => {
    expect(screen.getByText('Word Set 1')).toBeInTheDocument();
    expect(screen.getByText('10 Words')).toBeInTheDocument();
    expect(screen.getByText('Word Set 2')).toBeInTheDocument();
    expect(screen.getByText('20 Words')).toBeInTheDocument();
    expect(screen.getByText('Word Set 3')).toBeInTheDocument();
    expect(screen.getByText('15 Words')).toBeInTheDocument();
    expect(screen.getByText('Word Set 4')).toBeInTheDocument();
    expect(screen.getByText('25 Words')).toBeInTheDocument();
  });

  it('GO!ボタンクリック時にonSelectedWordSetが呼ばれること', () => {
    fireEvent.click(screen.getAllByText('GO!')[1]);
    expect(onSelectedWordSet).toHaveBeenCalledTimes(1);
    expect(onSelectedWordSet).toHaveBeenCalledWith('/path/to/wordset2');
  });
});