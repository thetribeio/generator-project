import { User } from '../domain/User';

export const mapUser = (user: User) => ({
    id: user.id,
    email: user.email,
});
