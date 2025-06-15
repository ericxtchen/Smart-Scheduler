import express from 'express';
import { authenticateUser } from '../middlewares/authenticateUser';
import { getEvents } from '../controllers/getEvents.controller';

const router = express.Router();

router.get("/api/calendar/events", authenticateUser, getEvents);
