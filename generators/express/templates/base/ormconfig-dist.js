module.exports = {
    ...require('./dist/infrastructure/database/config').default,
    migrations: ['dist/infrastructure/database/migrations/*.js'],
};
