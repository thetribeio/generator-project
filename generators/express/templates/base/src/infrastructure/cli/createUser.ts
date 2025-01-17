import createUser from '../../useCases/createUser';
import { userRepository } from '../database';
import dataSource from '../database/data-source';

(async () => {
    await dataSource.initialize();
    const args = process.argv.slice(2);

    const [username, password] = args;

    if (!username || !password) {
        console.error('Usage: createUser [username] [password]');
        process.exit(1);
    }

    await createUser({ username, password })({ userRepository });
})().catch((e) => console.error(e));
