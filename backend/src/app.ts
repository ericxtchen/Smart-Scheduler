import express from 'express';
import uploadRouter from './routes/uploadroutes';
import { corsMiddleware } from './middlewares/cors';

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use('/api', uploadRouter);

export default app;
