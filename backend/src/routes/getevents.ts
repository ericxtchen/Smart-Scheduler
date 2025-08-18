import express from 'express';
import getEvents from '../controllers/getEvents';
import getUserCalendarSources from '../controllers/getUserCalendarSources';
import { icsProxy } from '../controllers/ICSProxy';

const eventsRouter = express.Router();

eventsRouter.get("/user-calendar-sources/:userId", getUserCalendarSources);
eventsRouter.get("/events/:calendarSourceId", getEvents);
eventsRouter.get("/ics-proxy", icsProxy)

export default eventsRouter;
