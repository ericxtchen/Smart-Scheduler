import express from 'express';
import getEvents from '../controllers/getEvents';
import getUserCalendarSources from '../controllers/getUserCalendarSources';

const eventsRouter = express.Router();

eventsRouter.get("/user-calendar-sources/:userId", getUserCalendarSources);
eventsRouter.get("/events/:calendarSourceId", getEvents);

export default eventsRouter;
