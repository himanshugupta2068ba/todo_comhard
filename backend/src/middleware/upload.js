import crypto from 'node:crypto';
import fs from 'node:fs';
import multer from 'multer';
import path from 'node:path';

const uploadDirectory = path.resolve('uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname);
    callback(null, `${crypto.randomUUID()}${extension}`);
  }
});

export const taskAttachment = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
}).single('attachment');
