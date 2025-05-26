import express from 'express';
import { authenticateUser } from '../middlewares/authenticateUser';
import pdfUpload, { validatePDFType } from '../middlewares/pdf.multer';
import imgUpload, { validateImageType } from '../middlewares/image.multer';
import icsUpload, { validateICSType } from '../middlewares/ics.multer';
import parseICS from '../controllers/parseICS.controller';


const uploadRouter = express.Router();

uploadRouter.post('/upload-image', imgUpload.single('image'), validateImageType, authenticateUser, (req, res) => {
  console.log(req.user);
  res.status(200).json({ success: 'true' }) // uploading an image initially fails. tehn when clicking on the button, and then exiting out of the file popup, it says it uploadRouter
  // but there is no image
})

uploadRouter.post('/upload-pdf', pdfUpload.single('pdf'), validatePDFType, authenticateUser, (req, res) => {
  res.status(200).json({ success: 'true' })
})

uploadRouter.post('/upload-ics', icsUpload.single('ics'), validateICSType, authenticateUser, parseICS);

export default uploadRouter
