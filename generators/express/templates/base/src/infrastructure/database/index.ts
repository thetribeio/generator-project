import { getRepository } from 'typeorm';
import User from '../../domain/User';
import * as schemas from './schemas';

const userRepository = getRepository<User>(schemas.user);

export { userRepository };
