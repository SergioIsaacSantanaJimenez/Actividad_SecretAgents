import multer from 'multer';
import type { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';

// Usamos los tipos correctamente
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = ['.txt', '.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      return cb(new Error('Tipo de archivo no permitido'));
    }
    cb(null, true);
  },
});
