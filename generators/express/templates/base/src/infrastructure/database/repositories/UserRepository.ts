import { DataSource } from 'typeorm';
import { PaginationData } from '../../../domain/Pagination';
import { User, UserRepository } from '../../../domain/User';

class DatabaseUserRepository implements UserRepository {
    #dataSource: DataSource;

    constructor(dataSource: DataSource) {
        this.#dataSource = dataSource;
    }

    async all(pagination: PaginationData<User>): Promise<{users: User[], total: number}> {
        const skip = pagination.range ? pagination.range[0] : undefined;
        const take = pagination.range ? (pagination.range[1] - pagination.range[0] + 1) : undefined;
        const order = pagination.sort ? { [pagination.sort.field]: pagination.sort.order } : undefined;
        const where = pagination.filters && pagination.filters.email ? { email: pagination.filters.email } : undefined;
        const [users, total] = await this.#dataSource.manager.findAndCount(User, {
            skip,
            take,
            order,
            where,
        });

        return { users, total };
    }

    findById(id: string): Promise<User | null> {
        return this.#dataSource.manager.findOneBy(User, { id });
    }

    findByEmail(email: string): Promise<User | null> {
        return this.#dataSource.manager.findOneBy(User, { email });
    }

    async save(user: User): Promise<void> {
        await this.#dataSource.manager.save(user);
    }
}

export default DatabaseUserRepository;
