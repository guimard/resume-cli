export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['./src/**/*.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 50,
      lines: 90,
      statements: 90,
    },
  },
};
