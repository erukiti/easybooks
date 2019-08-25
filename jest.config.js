module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  testMatch: ['**/src/**/*.test.(ts|tsx|js|jsx)'],
  testPathIgnorePatterns: ['/node_modules/'],
  // setupFiles: ['jest-localstorage-mock', 'jest-date-mock']
}
