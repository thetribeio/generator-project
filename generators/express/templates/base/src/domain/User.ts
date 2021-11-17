import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

class User {
    id: string;

    email: string;

    passwordHash: string | null = null;

    constructor(email: string) {
        this.id = uuidv4();
        this.email = email;
    }

    async updatePassword(password: string): Promise<void> {
        this.passwordHash = await bcrypt.hash(password, 10);
    }

    async checkPassword(password: string): Promise<boolean> {
        if (this.passwordHash === null) {
            return false;
        }

        return bcrypt.compare(password, this.passwordHash);
    }
}

interface UserRepository {
    findOne(id: string): Promise<User | undefined>;
    findOne(condition: Partial<User>): Promise<User | undefined>;
}

export { User, UserRepository };
