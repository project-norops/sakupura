module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/packages"],
  testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverageFrom: [
    "packages/**/*.{ts,tsx}",
    "!packages/**/*.test.{ts,tsx}",
    "!packages/**/index.ts",
  ],
  coveragePathIgnorePatterns: ["/node_modules/"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
};
