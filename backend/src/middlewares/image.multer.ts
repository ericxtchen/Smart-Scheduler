import multer from 'multer';
import { NextFunction, Request, Response } from 'express';
import { fileTypeFromBuffer } from "file-type";

//const storage = multer.diskStorage({
//  destination: (req, file, cb) => {
//    const uploadDir = path.join(__dirname, 'uploads');
//    if (!fs.existsSync(uploadDir)) {
//      fs.mkdirSync(uploadDir, { recursive: true });
//    }
//    cb(null, uploadDir);
//  },
//  filename: (req, file, cb) => {
//    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//    cb(null, file.originalname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
//  }
//});
//
const storage = multer.memoryStorage();

//const filefilter = async (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
//try {
//console.log(req.body);
//const buffer = req.file?.buffer!; // is trying to read a file that hasn't been written to disk yet as filefilter runs before the file is saved.
// console.log(file.buffer);
// const type = await fileTypeFromBuffer(file.buffer); // how is this undefined??
// const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
//if (!type || !allowedTypes.includes(type.mime))
//   return cb(new Error('Invalid file type'));
// return cb(null, true);

//} catch (error) {
// if (error instanceof Error) {
// cb(error);
// }
// }
//if (file.mimetype === 'image/jpeg') {
//  cb(null, true);
//} else {
//  cb(new Error('Only images are allowed')); // where is this error showing?
//}
//};

const validateImageType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Now the file is available in req.file
    if (!req.file || !req.file.buffer) {
      res.status(400).json({ error: 'No file or file buffer found' });
      return;
    }

    const buffer = req.file.buffer;
    console.log(buffer);
    const type = await fileTypeFromBuffer(buffer);
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!type || !allowedTypes.includes(type.mime)) {
      res.status(400).json({ error: 'Invalid file type. Only JPEG, JPG, and PNG are allowed.' });
      return;
    }

    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'An unknown error occurred' });
    return;
  }
};


const imgUpload = multer({
  storage: storage,
  //fileFilter: filefilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});
export { validateImageType };
export default imgUpload;
