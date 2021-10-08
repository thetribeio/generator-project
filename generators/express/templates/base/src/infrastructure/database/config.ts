import { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as schemas from './schemas';

const config: ConnectionOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: Object.values(schemas),
    entitySkipConstructor: true,
    namingStrategy: new SnakeNamingStrategy(),
};

export default config;
