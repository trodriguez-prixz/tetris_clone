import { SCORE_DATA, LINES_PER_LEVEL } from '../config/settings.js';

export default class Score {
  constructor() {
    this.currentScore = 0;
    this.currentLevel = 1;
    this.linesCleared = 0;
    
    // Additional statistics
    this.piecesPlaced = 0;
    this.tetrises = 0; // 4-line clears
    this.singles = 0; // 1-line clears
    this.doubles = 0; // 2-line clears
    this.triples = 0; // 3-line clears
    this.startTime = null;
    this.gameTime = 0; // in seconds
  }

  addScore(lines) {
    if (lines < 1 || lines > 4) return;
    
    const basePoints = SCORE_DATA[lines] || 0;
    const points = basePoints * this.currentLevel;
    this.currentScore += points;
    this.linesCleared += lines;
    
    // Track line clear types
    if (lines === 1) this.singles++;
    else if (lines === 2) this.doubles++;
    else if (lines === 3) this.triples++;
    else if (lines === 4) this.tetrises++;
    
    // Check for level increase
    const newLevel = Math.floor(this.linesCleared / LINES_PER_LEVEL) + 1;
    if (newLevel > this.currentLevel) {
      this.currentLevel = newLevel;
      return true; // Level increased
    }
    
    return false; // Level did not increase
  }

  incrementPiecesPlaced() {
    this.piecesPlaced++;
  }

  startTimer() {
    this.startTime = Date.now();
  }

  updateGameTime() {
    if (this.startTime) {
      this.gameTime = Math.floor((Date.now() - this.startTime) / 1000);
    }
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

  getPiecesPlaced() {
    return this.piecesPlaced;
  }

  getTetrises() {
    return this.tetrises;
  }

  getSingles() {
    return this.singles;
  }

  getDoubles() {
    return this.doubles;
  }

  getTriples() {
    return this.triples;
  }

  getGameTime() {
    return this.gameTime;
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getAllStats() {
    return {
      score: this.currentScore,
      level: this.currentLevel,
      lines: this.linesCleared,
      pieces: this.piecesPlaced,
      tetrises: this.tetrises,
      singles: this.singles,
      doubles: this.doubles,
      triples: this.triples,
      time: this.gameTime,
      date: new Date().toISOString()
    };
  }

  reset() {
    this.currentScore = 0;
    this.currentLevel = 1;
    this.linesCleared = 0;
    this.piecesPlaced = 0;
    this.tetrises = 0;
    this.singles = 0;
    this.doubles = 0;
    this.triples = 0;
    this.startTime = null;
    this.gameTime = 0;
  }
}

