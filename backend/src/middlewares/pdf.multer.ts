import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

//const storage = multer.diskStorage({
//destination: (req, file, cb) => {
//  cb(null, 'uploads/'); // Create an 'uploads' folder if it doesn't exist
//},
//filename: (req, file, cb) => {
//  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//  cb(null, file.originalname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
//}
//});
//
const storage = multer.memoryStorage();

const filefilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

const pdfUpload = multer({
  storage: storage,
  fileFilter: filefilter
});

export default pdfUpload;
