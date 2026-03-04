/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js", "**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/__tests__/**",
    "!src/__tests__/setup.js",
  ],
  coverageDirectory: "coverage",
};
