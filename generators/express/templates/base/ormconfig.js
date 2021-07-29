require('ts-node').register();

module.exports = {
    ...require('./src/infrastructure/database/config').default,
    migrations: ['src/infrastructure/database/migrations/*.ts'],
    cli: {
        migrationsDir: 'src/infrastructure/database/migrations',
    },
};
