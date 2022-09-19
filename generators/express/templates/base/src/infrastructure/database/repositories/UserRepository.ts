import { DataSource } from 'typeorm';
import { User, UserRepository } from '../../../domain/User';

class DatabaseUserRepository implements UserRepository {
    #dataSource: DataSource;

    constructor(dataSource: DataSource) {
        this.#dataSource = dataSource;
    }

    all(): Promise<User[]> {
        return this.#dataSource.manager.find(User);
    }

    findById(id: string): Promise<User | null> {
        return this.#dataSource.manager.findOneBy(User, { id });
    }

    findByEmail(email: string): Promise<User | null> {
        return this.#dataSource.manager.findOneBy(User, { email });
    }
}

export default DatabaseUserRepository;
