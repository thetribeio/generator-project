import { EntitySchema } from 'typeorm';
import { User } from '../../../domain/User';

export default new EntitySchema<User>({
    name: User.name,
    target: User,
    columns: {
        id: {
            type: 'uuid',
            primary: true,
        },
        email: {
            type: 'character varying',
        },
        passwordHash: {
            type: 'character varying',
        },
    },
});
