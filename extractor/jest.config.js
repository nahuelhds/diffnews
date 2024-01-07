/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  preset: "ts-jest/presets/default-esm",
  transform: {
    "^.+\\.(mt|t|cj|j)s$": ["ts-jest", { "useESM": true }]
  },
  transformIgnorePatterns: ["node_modules/*"],
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.(m)?js$": "$1"
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(m)?ts$",
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.ts",
    "src/**/*.mts",
    "!src/**/*.d.ts",
    "!src/**/*.d.mts"
  ]
};
export default config;
