import express, { Request, Response, NextFunction } from 'express';
import { uploadMiddleware } from '../middlewares/upload';
import { uploadFile, getFileUrl } from '../services/s3Service';

const router = express.Router();

router.post('/upload', uploadMiddleware.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Archivo no proporcionado' });
      return;
    }
    const key = await uploadFile(req.file);
    const url = getFileUrl(key);
    res.json({ key, url });
  } catch (error) {
    next(error);
  }
});

router.get('/file/:key', (req: Request, res: Response) => {
  try {
    const url = getFileUrl(req.params.key);
    res.redirect(url);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener archivo' });
  }
});

export default router;
