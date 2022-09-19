import { getRepository } from 'typeorm';
import { User, UserRepository } from '../../../domain/User';

class DatabaseUserRepository implements UserRepository {
    all(): Promise<User[]> {
        return getRepository<User>(User).find();
    }

    async findById(id: string): Promise<User | null> {
        return (await getRepository<User>(User).findOne(id)) ?? null;
    }

    async findByEmail(email: string): Promise<User | null> {
        return (await getRepository<User>(User).findOne({ email })) ?? null;
    }
}

export default DatabaseUserRepository;
