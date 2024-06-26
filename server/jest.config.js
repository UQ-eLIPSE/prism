module.exports = {
  verbose: true,
  preset: "ts-jest",
  moduleFileExtensions: ["js", "ts", "tsx"],
  testPathIgnorePatterns: ["/node_modules/"],
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  testEnvironment: "node",
  testTimeout: 100000,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
