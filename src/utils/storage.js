import { normalizeLocale, DEFAULT_LOCALE } from '../i18n/index.js';

const STORAGE_KEYS = {
  HIGH_SCORES: 'tetris_high_scores',
  STATISTICS: 'tetris_statistics',
  PREFERENCES: 'tetris_preferences'
};

const DEFAULT_PREFERENCES = {
  ghostEnabled: true,
  musicMuted: false,
  soundEnabled: true,
  locale: DEFAULT_LOCALE
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

      localStorage.setItem(
        STORAGE_KEYS.HIGH_SCORES,
        JSON.stringify(highScores)
      );
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
      stats.totalTime += Number(gameStats.time) || 0;

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

  static getPreferences() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (!data) {
        return { ...DEFAULT_PREFERENCES };
      }

      const parsed = JSON.parse(data);
      return {
        ghostEnabled:
          typeof parsed.ghostEnabled === 'boolean'
            ? parsed.ghostEnabled
            : DEFAULT_PREFERENCES.ghostEnabled,
        musicMuted:
          typeof parsed.musicMuted === 'boolean'
            ? parsed.musicMuted
            : DEFAULT_PREFERENCES.musicMuted,
        soundEnabled:
          typeof parsed.soundEnabled === 'boolean'
            ? parsed.soundEnabled
            : DEFAULT_PREFERENCES.soundEnabled,
        locale: normalizeLocale(parsed.locale)
      };
    } catch (error) {
      console.warn('Error loading preferences:', error);
      return { ...DEFAULT_PREFERENCES };
    }
  }

  static savePreferences(preferences) {
    try {
      const next = {
        ghostEnabled:
          typeof preferences?.ghostEnabled === 'boolean'
            ? preferences.ghostEnabled
            : DEFAULT_PREFERENCES.ghostEnabled,
        musicMuted:
          typeof preferences?.musicMuted === 'boolean'
            ? preferences.musicMuted
            : DEFAULT_PREFERENCES.musicMuted,
        soundEnabled:
          typeof preferences?.soundEnabled === 'boolean'
            ? preferences.soundEnabled
            : DEFAULT_PREFERENCES.soundEnabled,
        locale: normalizeLocale(preferences?.locale)
      };
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(next));
      return true;
    } catch (error) {
      console.warn('Error saving preferences:', error);
      return false;
    }
  }

  static clearAllData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.HIGH_SCORES);
      localStorage.removeItem(STORAGE_KEYS.STATISTICS);
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
      return true;
    } catch (error) {
      console.warn('Error clearing data:', error);
      return false;
    }
  }
}
