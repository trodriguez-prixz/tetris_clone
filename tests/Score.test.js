import Score from '../src/classes/Score.js';
import { SCORE_DATA, LINES_PER_LEVEL } from '../src/config/settings.js';

describe('Score', () => {
  let score;

  beforeEach(() => {
    score = new Score();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('initializes score, level, line counters, piece counters, and timer state', () => {
    expect(score.getScore()).toBe(0);
    expect(score.getLevel()).toBe(1);
    expect(score.getLinesCleared()).toBe(0);
    expect(score.getPiecesPlaced()).toBe(0);
    expect(score.getSingles()).toBe(0);
    expect(score.getDoubles()).toBe(0);
    expect(score.getTriples()).toBe(0);
    expect(score.getTetrises()).toBe(0);
    expect(score.getGameTime()).toBe(0);
  });

  test('adds line-clear score with the current level multiplier and reports level changes', () => {
    expect(score.addScore(4)).toBe(false);
    expect(score.getScore()).toBe(SCORE_DATA[4]);
    expect(score.getLinesCleared()).toBe(4);
    expect(score.getTetrises()).toBe(1);

    score.addScore(3);
    score.addScore(2);
    expect(score.getLevel()).toBe(1);

    expect(score.addScore(1)).toBe(true);
    expect(score.getLevel()).toBe(2);
    expect(score.getLinesCleared()).toBe(LINES_PER_LEVEL);

    const scoreBeforeLevelTwoClear = score.getScore();
    expect(score.addScore(1)).toBe(false);
    expect(score.getScore()).toBe(scoreBeforeLevelTwoClear + SCORE_DATA[1] * 2);
  });

  test('tracks each line-clear type independently', () => {
    score.addScore(1);
    score.addScore(2);
    score.addScore(3);
    score.addScore(4);

    expect(score.getSingles()).toBe(1);
    expect(score.getDoubles()).toBe(1);
    expect(score.getTriples()).toBe(1);
    expect(score.getTetrises()).toBe(1);
    expect(score.getLinesCleared()).toBe(10);
  });

  test('ignores invalid line-clear counts without changing score state', () => {
    const initialStats = score.getAllStats();

    expect(score.addScore(0)).toBeUndefined();
    expect(score.addScore(5)).toBeUndefined();
    expect(score.addScore(-1)).toBeUndefined();

    expect(score.getScore()).toBe(initialStats.score);
    expect(score.getLevel()).toBe(initialStats.level);
    expect(score.getLinesCleared()).toBe(initialStats.lines);
    expect(score.getSingles()).toBe(initialStats.singles);
    expect(score.getDoubles()).toBe(initialStats.doubles);
    expect(score.getTriples()).toBe(initialStats.triples);
    expect(score.getTetrises()).toBe(initialStats.tetrises);
  });

  test('increments pieces placed and returns a complete stats snapshot', () => {
    score.addScore(1);
    score.incrementPiecesPlaced();
    score.incrementPiecesPlaced();
    jest
      .spyOn(Date.prototype, 'toISOString')
      .mockReturnValue('2026-07-02T00:00:00.000Z');

    expect(score.getPiecesPlaced()).toBe(2);
    expect(score.getAllStats()).toEqual({
      score: SCORE_DATA[1],
      level: 1,
      lines: 1,
      pieces: 2,
      tetrises: 0,
      singles: 1,
      doubles: 0,
      triples: 0,
      time: 0,
      date: '2026-07-02T00:00:00.000Z'
    });
  });

  test('updates and formats elapsed game time after the timer starts', () => {
    jest
      .spyOn(Date, 'now')
      .mockReturnValueOnce(1_000)
      .mockReturnValueOnce(66_000);

    score.startTimer();
    score.updateGameTime();

    expect(score.getGameTime()).toBe(65);
    expect(score.formatTime(score.getGameTime())).toBe('1:05');
  });

  test('reset restores all score, stats, and timer values', () => {
    jest
      .spyOn(Date, 'now')
      .mockReturnValueOnce(1_000)
      .mockReturnValueOnce(3_000);
    score.addScore(4);
    score.incrementPiecesPlaced();
    score.startTimer();
    score.updateGameTime();

    score.reset();

    expect(score.getAllStats()).toMatchObject({
      score: 0,
      level: 1,
      lines: 0,
      pieces: 0,
      tetrises: 0,
      singles: 0,
      doubles: 0,
      triples: 0,
      time: 0
    });
  });
});
