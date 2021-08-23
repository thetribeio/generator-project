import { EntitySchema } from 'typeorm';

export default new EntitySchema({
    name: 'user',
    columns: {
        id: {
            type: 'uuid',
            primary: true,
        },
        email: {
            type: 'character varying',
        },
    },
});
