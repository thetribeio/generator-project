import createUser from '../../useCases/createUser';
import { userRepository } from '../database';
import dataSource from '../database/data-source';

(async () => {
    await dataSource.initialize();
    const args = process.argv.slice(2);

    const [email, password] = args;

    if (!email || !password) {
        console.error('Usage: createUser [email] [password]');
        process.exit(1);
    }

    await createUser({ email, password })({ userRepository });
})().catch((e) => console.error(e));
