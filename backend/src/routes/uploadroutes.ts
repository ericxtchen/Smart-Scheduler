import express from 'express';
import { authenticateUser } from '../middlewares/authenticateUser';
import pdfUpload from '../middlewares/pdf.multer';
import imgUpload, { validateFileType } from '../middlewares/image.multer';
import icsUpload from '../middlewares/ics.multer';


const uploadRouter = express.Router();

uploadRouter.post('/upload-image', imgUpload.single('image'), validateFileType, authenticateUser, (req, res) => {
  res.status(200).json({ success: 'true' }) // uploading an image initially fails. tehn when clicking on the button, and then exiting out of the file popup, it says it uploadRouter
  // but there is no image
})

uploadRouter.post('/upload-pdf', pdfUpload.single('pdf'), (req, res) => {
  res.status(200).json({ success: 'true' })
})

uploadRouter.post('/upload-ics', icsUpload.single('ics'), (req, res) => {
  res.status(200).json({ success: 'true' })
})

export default uploadRouter
