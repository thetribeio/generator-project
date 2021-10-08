import { User, UserRepository } from '../domain/User';
import UserError from './UserError';

interface Arg {
    username: string,
    password: string,
}

interface Context {
    userRepository: UserRepository;
}

const loginUser = ({ username, password }: Arg) => async ({ userRepository }: Context): Promise<User> => {
    const user = await userRepository.findOne({ email: username });

    if (!user) {
        throw new UserError('Incorrect username.');
    }

    if (!await user.checkPassword(password)) {
        throw new UserError('Incorrect password.');
    }

    return user;
};

export default loginUser;
