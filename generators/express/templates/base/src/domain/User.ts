import { v4 as uuidv4 } from 'uuid';

class User {
    id: string;

    email: string;

    constructor({ email }: Pick<User, 'email'>) {
        this.id = uuidv4();
        this.email = email;
    }
}

export default User;
