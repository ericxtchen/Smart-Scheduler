import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { fileTypeFromBuffer } from 'file-type';

const storage = multer.memoryStorage();

const validatePDFType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Now the file is available in req.file
    if (!req.file || !req.file.buffer) {
      res.status(400).json({ error: 'No file or file buffer found' });
      return;
    }

    const buffer = req.file.buffer;
    const type = await fileTypeFromBuffer(buffer);
    const allowedTypes = ["application/pdf"];

    if (!type || !allowedTypes.includes(type.mime)) {
      res.status(400).json({ error: 'Invalid file type. Only PDF files are allowed.' });
      return;
    }

    next();
    return;
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'An unknown error occurred' });
    return;
  }
};



const pdfUpload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

export { validatePDFType };
export default pdfUpload;
