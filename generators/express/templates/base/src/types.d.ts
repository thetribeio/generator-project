import { User as UserModel } from './domain/User';

declare global {
    namespace Express {
        interface User extends UserModel {}
    }
}
