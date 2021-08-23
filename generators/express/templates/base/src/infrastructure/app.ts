import * as Sentry from '@sentry/node';
import express from 'express';
import usersRouter from './routes/users';

const app = express();

app.use(Sentry.Handlers.requestHandler());

app.use(express.json());

app.use('/users/', usersRouter);

app.use(Sentry.Handlers.errorHandler());

export default app;
