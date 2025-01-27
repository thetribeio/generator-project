import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

class User {
    id: string;

    email: string;

    passwordHash: string | null = null;

    constructor(email: string) {
        this.id = randomUUID();
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
    all(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    save(user: User): Promise<void>
}

export { User, UserRepository };
