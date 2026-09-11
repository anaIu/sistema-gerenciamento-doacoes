module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "models/**/*.js",
    "controllers/**/*.js",
    "middleware/**/*.js",
    "utils/**/*.js",
    "!**/node_modules/**"
  ],
  coverageThreshold: {
    global: {
      lines: 70,
      functions: 70,
      statements: 70,
      branches: 60
    }
  }
};