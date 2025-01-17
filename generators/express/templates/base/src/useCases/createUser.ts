import { User, UserRepository } from '../domain/User';

interface Arg {
    username: string,
    password: string,
}

interface Context {
    userRepository: UserRepository;
}

const createUser = ({ username, password }: Arg) => async ({ userRepository }: Context): Promise<User> => {
    const user = new User(username);
    await user.updatePassword(password);

    await userRepository.save(user);

    return user;
};

export default createUser;
