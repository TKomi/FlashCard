import { WordSetIndexUtil } from './WordSetIndex';

describe('WordSetIndexUtil', () => {
  beforeEach(() => {
    const index = `
    {
      "dataSet": [
        {
          "seriesNo": 1,
          "seriesName": "Series 1",
          "seriesDescription": "Description of Series 1",
          "size": 100,
          "wordSets": [
            {
              "wordSetNo": 1,
              "wordSetName": "Part1",
              "filePath": "path/to/part1.json",
              "size": 50
            },
            {
              "wordSetNo": 2,
              "wordSetName": "Part2",
              "filePath": "path/to/part2.json",
              "size": 50
            }
          ]
        },
        {
          "seriesNo": 2,
          "seriesName": "Series 2",
          "seriesDescription": "Description of Series 2",
          "size": 50,
          "wordSets": [
            {
              "wordSetNo": 11,
              "wordSetName": "Part11",
              "filePath": "path/to/part11.json",
              "size": 25
            },
            {
              "wordSetNo": 12,
              "wordSetName": "Part12",
              "filePath": "path/to/part12.json",
              "size": 25
            }
          ]
        }
      ]
    }
    `;

    global.fetch = jest.fn(() =>
      Promise.resolve(new Response(index))
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Test loadFromIndexJson', () => {
    it('sample.jsonからの読込に成功すること', async () => {
      // Arrange
      const indexFilePath = 'sample.json';
      const expected = [
        {
          seriesNo: 1,
          seriesName: "Series 1",
          seriesDescription: "Description of Series 1",
          size: 100,
          wordSets: [
            {
              wordSetNo: 1,
              wordSetName: "Part1",
              filePath: "path/to/part1.json",
              size: 50,
            },
            {
              wordSetNo: 2,
              wordSetName: "Part2",
              filePath: "path/to/part2.json",
              size: 50,
            },
          ],
        },
        {
          seriesNo: 2,
          seriesName: "Series 2",
          seriesDescription: "Description of Series 2",
          size: 50,
          wordSets: [
            {
              wordSetNo: 11,
              wordSetName: "Part11",
              filePath: "path/to/part11.json",
              size: 25,
            },
            {
              wordSetNo: 12,
              wordSetName: "Part12",
              filePath: "path/to/part12.json",
              size: 25,
            },
          ],
        },
      ];

      // Act
      const result = await WordSetIndexUtil.loadFromIndexJson(indexFilePath);

      // Assert
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    });
  });
});