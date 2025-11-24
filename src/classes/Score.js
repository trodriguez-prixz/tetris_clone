import { SCORE_DATA, LINES_PER_LEVEL } from '../config/settings.js';

export default class Score {
  constructor() {
    this.currentScore = 0;
    this.currentLevel = 1;
    this.linesCleared = 0;
  }

  addScore(lines) {
    if (lines < 1 || lines > 4) return;
    
    const basePoints = SCORE_DATA[lines] || 0;
    const points = basePoints * this.currentLevel;
    this.currentScore += points;
    this.linesCleared += lines;
    
    // Check for level increase
    const newLevel = Math.floor(this.linesCleared / LINES_PER_LEVEL) + 1;
    if (newLevel > this.currentLevel) {
      this.currentLevel = newLevel;
      return true; // Level increased
    }
    
    return false; // Level did not increase
  }

  getScore() {
    return this.currentScore;
  }

  getLevel() {
    return this.currentLevel;
  }

  getLinesCleared() {
    return this.linesCleared;
  }

  reset() {
    this.currentScore = 0;
    this.currentLevel = 1;
    this.linesCleared = 0;
  }
}

