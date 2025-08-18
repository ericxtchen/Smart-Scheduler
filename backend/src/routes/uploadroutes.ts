import express from 'express';
import { authenticateUser } from '../middlewares/authenticateUser';
import pdfUpload, { validatePDFType } from '../middlewares/pdf.multer';
import imgUpload, { validateImageType } from '../middlewares/image.multer';
import icsUpload, { validateICSType } from '../middlewares/ics.multer';
import parseICS from '../controllers/parseICS.controller';
import { parseICSLink } from '../controllers/parseICSLink.controller';
import { parseImg } from '../controllers/parseImg.controller';
import { pdfController } from '../controllers/pdfUploadController';


const uploadRouter = express.Router();

uploadRouter.post('/upload-image', imgUpload.single('image'), validateImageType, authenticateUser, parseImg);

uploadRouter.post('/upload-pdf', pdfUpload.single('pdf'), validatePDFType, authenticateUser, pdfController)

uploadRouter.post('/upload-ics', icsUpload.single('ics'), validateICSType, authenticateUser, parseICS);

uploadRouter.post('/upload-ics-link', authenticateUser, parseICSLink);

export default uploadRouter
