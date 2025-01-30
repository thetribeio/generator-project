import { User, UserRepository } from '../domain/User';

interface Arg {
    email: string,
    password: string,
}

interface Context {
    userRepository: UserRepository;
}

const createUser = ({ email, password }: Arg) => async ({ userRepository }: Context): Promise<User> => {
    const user = new User(email);
    await user.updatePassword(password);

    await userRepository.save(user);

    return user;
};

export default createUser;
