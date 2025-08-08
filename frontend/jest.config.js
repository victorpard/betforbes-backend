export default {
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    '\\.svg$': '<rootDir>/jest-svg-transformer.js',
    '\\.css$': '<rootDir>/__mocks__/styleMock.js'
  },
  moduleNameMapper: {
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
    '\\.svg$': '<rootDir>/jest-svg-transformer.js'
  },
  setupFilesAfterEnv: [
    '@testing-library/jest-dom/extend-expect'
  ],
  testRegex: '(/src/.*\\.test)\\.(js|jsx|ts|tsx)$',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node']
};
