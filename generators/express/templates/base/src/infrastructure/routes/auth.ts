import { Request, Response, Router } from 'express';
import auth from '../auth';
import { mapUser } from '../mappers';

const router = Router();

router.post('/login', auth.authenticate('local'), (req: Request, res: Response) => {
    res.json(mapUser(req.user!));
});

router.post('/logout', (req: Request, res: Response) => {
    req.logout();

    res.sendStatus(200);
});

router.get('/me', (req: Request, res: Response) => {
    if (req.user) {
        res.json(mapUser(req.user));
    } else {
        res.sendStatus(404);
    }
});

export default router;
