import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

const coreRuleModules = [
  'src/logic/GameState.js',
  'src/logic/GameStateMachine.js',
  'src/classes/Block.js',
  'src/classes/Tetramino.js',
  'src/classes/Score.js'
];

describe('Phaser boundary', () => {
  test('core rule modules do not import Phaser or the Phaser-backed EventBus', () => {
    coreRuleModules.forEach((modulePath) => {
      const source = fs.readFileSync(
        path.join(projectRoot, modulePath),
        'utf8'
      );

      expect(source).not.toMatch(/from ['"]phaser['"]/);
      expect(source).not.toMatch(/from ['"]\.\.\/events\/EventBus\.js['"]/);
    });
  });
});
