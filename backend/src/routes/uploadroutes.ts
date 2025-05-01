import express from 'express';
import { authenticateUser } from '../middlewares/authenticateUser';


const uploadRouter = express.Router();
uploadRouter.use(authenticateUser);

uploadRouter.post('/upload-image', (req, res) => {
  res.status(200).json({ success: 'true' })
})

export default uploadRouter
