# Migrations

## To generate a migration
You can run : `docker-compose run --rm backend typeorm-ts-node-commonjs migration:generate src/infrastructure/database/migrations/{nameMigration} -d src/infrastructure/database/data-source.ts`
## To launch migrations
You can run : `docker-compose run --rm backend typeorm-ts-node-commonjs migration:run -d src/infrastructure/database/data-source.ts`
