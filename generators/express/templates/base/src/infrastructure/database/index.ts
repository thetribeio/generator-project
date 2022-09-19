import dataSource from './data-source';
import DatabaseUserRepository from './repositories/UserRepository';

const userRepository = new DatabaseUserRepository(dataSource);

export { userRepository };
