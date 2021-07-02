module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.[jt]sx?$': 'ts-jest',
    },
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
    ],
};
