import * as Sentry from '@sentry/node';
import express, { RequestHandler } from 'express';
import session from 'express-session';
import auth from './auth';
import authRouter from './routes/auth';
import healthRouter from './routes/health';
import usersRouter from './routes/users';

const app = express();

app.use(Sentry.Handlers.requestHandler());

app.use('/health', healthRouter);

// Parse request
app.use(express.json());

// Session
const secret = process.env.COOKIE_SECRET;

if (!secret) {
    throw new Error('Missing COOKIE_SECRET env variable');
}

app.use(session({
    secret,
}) as RequestHandler);

// Init authentication
app.use(auth.initialize() as RequestHandler);
app.use(auth.session());

app.use('/', authRouter);
app.use('/users/', usersRouter);

app.use(Sentry.Handlers.errorHandler());

export default app;
