/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['./'],
  randomize: true,
  reporters: [["jest-silent-reporter", { "showWarnings": true }]],
  "transformIgnorePatterns": [
    "/node_modules/(?!@coolgedon/)"
  ],
  moduleNameMapper: {
    "Event(.*)": "<rootDir>/src/events/$1",
    "CardHandler(.*)": "<rootDir>/src/cardHandlers/$1",
    "GuardHandler(.*)": "<rootDir>/src/guardHandlers/$1",
    "Entity(.*)": "<rootDir>/src/entities/$1",
    "Type(.*)": "<rootDir>/src/types/$1",
    "Helpers(.*)": "<rootDir>/src/helpers/$1",
    "Rooms": "<rootDir>/src/rooms.ts",
    "Player": "<rootDir>/src/player.ts",
    "AvailableCards": "<rootDir>/src/availableCards.ts",
    "GameHandlers": "<rootDir>/src/gameHandlers.ts",
    "Index": "<rootDir>/src/index.ts"
  },
};
