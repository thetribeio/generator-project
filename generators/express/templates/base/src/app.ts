import * as Sentry from '@sentry/node';
import express from 'express';
import exampleRouter from './routes/example';

const app = express();

app.use(Sentry.Handlers.requestHandler());

app.use(express.json());

app.use('/example/', exampleRouter);

app.use(Sentry.Handlers.errorHandler());

export default app;
