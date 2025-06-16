import express from 'express';
import { authenticateUser } from '../middlewares/authenticateUser';
import { getEvents } from '../controllers/getEvents.controller';

const eventsRouter = express.Router();

eventsRouter.get("/calendar/events", authenticateUser, getEvents);

export default eventsRouter;
