import { StorageManager } from '../src/utils/storage.js';

describe('StorageManager.updateStatistics time contract', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('totalTime increases by run time from gameStats.time', () => {
    localStorage.setItem(
      'tetris_statistics',
      JSON.stringify({
        totalGames: 1,
        totalScore: 100,
        totalLines: 2,
        totalPieces: 5,
        totalTetrises: 0,
        totalTime: 50,
        bestLevel: 1
      })
    );

    StorageManager.updateStatistics({
      score: 200,
      lines: 4,
      pieces: 8,
      tetrises: 1,
      level: 2,
      time: 30
    });

    const stats = StorageManager.getStatistics();
    expect(stats.totalTime).toBe(80);
    expect(stats.totalGames).toBe(2);
  });

  test('gameTime-only stats do not accumulate into totalTime', () => {
    localStorage.setItem(
      'tetris_statistics',
      JSON.stringify({
        totalGames: 0,
        totalScore: 0,
        totalLines: 0,
        totalPieces: 0,
        totalTetrises: 0,
        totalTime: 100,
        bestLevel: 0
      })
    );

    StorageManager.updateStatistics({
      score: 50,
      lines: 1,
      pieces: 2,
      tetrises: 0,
      level: 1,
      gameTime: 45
    });

    const stats = StorageManager.getStatistics();
    expect(stats.totalTime).toBe(100);
  });
});
