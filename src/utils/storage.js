// LocalStorage utility for saving/loading game data

const STORAGE_KEYS = {
  HIGH_SCORES: 'tetris_high_scores',
  STATISTICS: 'tetris_statistics'
};

export class StorageManager {
  // High Scores Management
  static getHighScores() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Error loading high scores:', error);
    }
    return [];
  }

  static saveHighScore(scoreData) {
    try {
      let highScores = this.getHighScores();
      
      // Add new score
      highScores.push(scoreData);
      
      // Sort by score (descending)
      highScores.sort((a, b) => b.score - a.score);
      
      // Keep only top 10
      highScores = highScores.slice(0, 10);
      
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(highScores));
      return true;
    } catch (error) {
      console.warn('Error saving high score:', error);
      return false;
    }
  }

  static getBestScore() {
    const highScores = this.getHighScores();
    return highScores.length > 0 ? highScores[0].score : 0;
  }

  // Statistics Management (lifetime stats)
  static getStatistics() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATISTICS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Error loading statistics:', error);
    }
    return {
      totalGames: 0,
      totalScore: 0,
      totalLines: 0,
      totalPieces: 0,
      totalTetrises: 0,
      totalTime: 0,
      bestLevel: 0
    };
  }

  static updateStatistics(gameStats) {
    try {
      const stats = this.getStatistics();
      
      stats.totalGames++;
      stats.totalScore += gameStats.score;
      stats.totalLines += gameStats.lines;
      stats.totalPieces += gameStats.pieces;
      stats.totalTetrises += gameStats.tetrises;
      stats.totalTime += gameStats.time;
      
      if (gameStats.level > stats.bestLevel) {
        stats.bestLevel = gameStats.level;
      }
      
      localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(stats));
      return true;
    } catch (error) {
      console.warn('Error updating statistics:', error);
      return false;
    }
  }

  static clearAllData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.HIGH_SCORES);
      localStorage.removeItem(STORAGE_KEYS.STATISTICS);
      return true;
    } catch (error) {
      console.warn('Error clearing data:', error);
      return false;
    }
  }
}

