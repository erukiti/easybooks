module.exports = {
  moduleFileExtensions: ['js', 'ts', 'tsx', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  testMatch: ['**/*.test.(ts|tsx|js|jsx)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  preset: 'ts-jest',
}
