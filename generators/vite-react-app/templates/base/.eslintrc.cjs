module.exports = {
    root: true,
    parserOptions: {
        project: './tsconfig.json'
    },
    env: {
        browser: true,
    },
    extends: [
        '@thetribe/eslint-config-react-typescript',
    ],
    rules: {
        'import/no-extraneous-dependencies': 'off',
    }
};
