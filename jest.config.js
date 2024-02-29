// jest.config.mjs
export default {
    transform:  {
        '^.+\\.[t|j]sx?$': 'babel-jest'
      },
    moduleNameMapper: {
      "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    testEnvironment: "node",
    transformIgnorePatterns: ["<rootDir>/node_modules/"]   
  };


  