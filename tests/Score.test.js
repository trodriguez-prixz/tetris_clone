import Score from '../src/classes/Score.js';
import { SCORE_DATA, LINES_PER_LEVEL } from '../src/config/settings.js';

describe('Score', () => {
  let score;

  beforeEach(() => {
    score = new Score();
  });

  test('Score initializes with zero values', () => {
    expect(score.getScore()).toBe(0);
    expect(score.getLevel()).toBe(1);
    expect(score.getLinesCleared()).toBe(0);
  });

  test('addScore calculates points correctly with level multiplier', () => {
    score.addScore(1);
    expect(score.getScore()).toBe(SCORE_DATA[1] * 1); // 40 * 1
    
    score.addScore(2);
    expect(score.getScore()).toBe(SCORE_DATA[1] * 1 + SCORE_DATA[2] * 1); // 40 + 100
  });

  test('addScore increases level every 10 lines', () => {
    // Clear 9 lines - should still be level 1
    for (let i = 0; i < 9; i++) {
      score.addScore(1);
    }
    expect(score.getLevel()).toBe(1);
    
    // Clear 1 more line - should be level 2
    const levelIncreased = score.addScore(1);
    expect(score.getLevel()).toBe(2);
    expect(levelIncreased).toBe(true);
  });

  test('addScore multiplies points by current level', () => {
    // Get to level 2
    for (let i = 0; i < LINES_PER_LEVEL; i++) {
      score.addScore(1);
    }
    expect(score.getLevel()).toBe(2);
    
    // Clear 1 line at level 2
    const previousScore = score.getScore();
    score.addScore(1);
    expect(score.getScore()).toBe(previousScore + (SCORE_DATA[1] * 2));
  });

  test('reset resets all values', () => {
    score.addScore(4);
    score.reset();
    
    expect(score.getScore()).toBe(0);
    expect(score.getLevel()).toBe(1);
    expect(score.getLinesCleared()).toBe(0);
  });
});

