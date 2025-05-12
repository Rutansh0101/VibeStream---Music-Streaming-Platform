import express from 'express';
import { getProfile, updateProfile, getUserStats, getArtists, getUserById } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Use the variable we just created and verified
  },
  filename: function (req, file, cb) {
    cb(null, `user-${req.userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Filter only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.get('/stats', protect, getUserStats);

router.get('/artists', getArtists); // Get artists
router.get('/:id', getUserById);

export default router;