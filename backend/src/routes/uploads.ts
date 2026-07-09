import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { protect, AuthRequest } from '../middleware/auth';
import { uploadLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(uploadLimiter);

// Ensure local upload directory exists
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Multer Filter for File Validation
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|webp|pdf/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extName) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

// Configure Cloudinary if credentials are present
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// @route   POST /api/uploads
// @desc    Upload product image, factory certificate, or brand logo
// @access  Protected (Any registered user)
router.post(
  '/',
  protect,
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  async (req: AuthRequest, res: Response, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please provide a file to upload.' });
      }

      const localFilePath = req.file.path;

      if (isCloudinaryConfigured) {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(localFilePath, {
          folder: 'verichain',
          resource_type: req.file.mimetype === 'application/pdf' ? 'raw' : 'image',
        });

        // Delete local temp file
        fs.unlinkSync(localFilePath);

        return res.json({
          success: true,
          url: result.secure_url,
          storage: 'cloudinary',
        });
      } else {
        // Return local server URL path
        const port = process.env.PORT || 5000;
        const relativePath = `/public/uploads/${req.file.filename}`;
        
        // Return relative path or host url if origin is present
        const host = req.get('host') || `localhost:${port}`;
        const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
        const fileUrl = `${protocol}://${host}${relativePath}`;

        return res.json({
          success: true,
          url: fileUrl,
          storage: 'local',
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

export default router;
