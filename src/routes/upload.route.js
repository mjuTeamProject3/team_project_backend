import express from 'express';
import multer from 'multer';
import { join } from 'path';
import { mkdirSync } from 'fs';

const route = express.Router();

const uploadDir = join(process.cwd(), 'public', 'uploads');
try { mkdirSync(uploadDir, { recursive: true }); } catch {}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const ext = (file.originalname.split('.').pop() || 'jpg').toLowerCase();
    cb(null, `${ts}_${Math.random().toString(36).slice(2,8)}.${ext}`);
  },
});
const upload = multer({ storage });

route.post('/image', upload.single('file'), (req, res) => {
  const filename = req.file.filename;
  const url = `/uploads/${filename}`;
  res.json({ url });
});

export default route;
