import multer from "multer";
import path from "path";
import crypto from "crypto";

const memoryStorage = multer.memoryStorage();

const uploadToMemory = multer({ 
    storage: memoryStorage,
    limits: { fileSize: 100 * 1024 * 1024 }
});

const diskStorage = multer.diskStorage({
  destination: "./temp",
  filename: (req, file, cb) => {
    crypto.randomBytes(16, (err, buf) => {
      if (err) {
        return cb(err);
      }
      const uniqueName = buf.toString('hex');
      const extension = path.extname(file.originalname);
      cb(null, uniqueName + extension);
    });
  }
});

const uploadToDisk = multer({ 
    storage: diskStorage,
    limits: { fileSize: 100 * 1024 * 1024 }
});

export { uploadToDisk, uploadToMemory };