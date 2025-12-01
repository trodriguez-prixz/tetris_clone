export default {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/tests/setup.js'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^phaser$': '<rootDir>/tests/__mocks__/phaser.js'
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/main.js',
    '!src/utils/retroMusic.js'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ]
};

