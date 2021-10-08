import { getRepository } from 'typeorm';
import { User } from '../../domain/User';

const userRepository = getRepository<User>(User);

export { userRepository };
