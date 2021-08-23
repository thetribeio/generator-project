import { ConnectionOptions } from 'typeorm';
import * as schemas from './schemas';

const config: ConnectionOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: Object.values(schemas),
};

export default config;
