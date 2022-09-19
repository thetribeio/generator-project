import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as schemas from './schemas';

export default new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: Object.values(schemas),
    entitySkipConstructor: true,
    migrations: [`${__dirname}/migrations/*.{js,ts}`],
    namingStrategy: new SnakeNamingStrategy(),
});
