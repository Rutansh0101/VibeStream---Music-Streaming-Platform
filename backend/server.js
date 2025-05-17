import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import {connectCloudinary} from './config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

import authRouter from './routes/authRoutes.js';
import songRouter from './routes/songRoutes.js';
import albumRouter from './routes/albumRoutes.js';
import userRouter from './routes/userRoutes.js';
import playlistRouter from './routes/playlistRoutes.js';
import searchRouter from './routes/searchRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;
connectDB();
connectCloudinary();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.send('Music Streaming Platform API is running!');
});

app.use('/api/auth', authRouter);// /api/auth/logout
app.use('/api/songs', songRouter);
app.use('/api/albums', albumRouter);
app.use('/api/user', userRouter);
app.use('/api/playlists', playlistRouter);
app.use('/api/search', searchRouter);


const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use((err, req, res, next) => {
  console.error('ERROR:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Max size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});