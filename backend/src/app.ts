import express from 'express';
import uploadRouter from './routes/uploadroutes';
import eventsRouter from './routes/getevents';
import { corsMiddleware } from './middlewares/cors';

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use('/api', uploadRouter);
app.use('/api', eventsRouter);


export default app;
