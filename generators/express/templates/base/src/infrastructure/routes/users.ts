import { Request, Response, Router } from 'express';
import { User } from '../../domain/User';
import listUsers from '../../useCases/listUsers';
import { userRepository } from '../database';
import { mapUser } from '../mappers';
import parseRange from './utils/parseRange';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const sort = req.query.sort ? JSON.parse(req.query.sort as string) as [keyof User, 'ASC' | 'DESC'] : null;
    const filters = req.query.filter ? JSON.parse(req.query.filter as string) as { ['email']: string} : null;
    const range = parseRange(req.headers.range);

    const { users, total } = await listUsers({
        filters,
        range,
        sort: sort ? {
            field: sort[0],
            order: sort[1],
        } : null,
    })({
        userRepository,
    });

    if (range) {
        res.header('content-range', `items ${range[0]}-${range[0] + users.length - 1}/${total}`);
    }

    res.json(users.map(mapUser));
});

export default router;
