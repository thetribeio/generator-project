import { PaginationData } from '../domain/Pagination';
import { UserRepository, User } from '../domain/User';

interface ListUsersContext {
    userRepository: UserRepository;
}

type ListUsersResponse = Promise<{ users: User[], total: number }>;

const listUsers = (pagination: PaginationData<User>) => async ({
    userRepository,
}: ListUsersContext): ListUsersResponse => userRepository.all(pagination);

export { ListUsersContext, ListUsersResponse };
export default listUsers;
