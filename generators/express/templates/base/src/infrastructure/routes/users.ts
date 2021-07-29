import { Request, Response, Router } from 'express';
import { userRepository } from '../database';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    res.json(await userRepository.find());
});

export default router;
