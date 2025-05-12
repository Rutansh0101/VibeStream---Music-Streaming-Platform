import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

// Import routes
import authRouter from './routes/authRoutes.js';
import songRouter from './routes/songRoutes.js';
import albumRouter from './routes/albumRoutes.js';
import userRouter from './routes/userRoutes.js';
import playlistRouter from './routes/playlistRoutes.js';
import searchRouter from './routes/searchRoutes.js';

// App config
const app = express();
const PORT = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// Middlewares
app.use(express.json());
app.use(cookieParser()); // Add cookie parser for JWT refresh tokens

// Fix CORS configuration to handle credentials properly
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend dev server URL
  credentials: true // Allow credentials (cookies, auth headers)
}));
app.use(express.urlencoded({extended: true}));

// Root route
app.get('/', (req, res) => {
  res.send('Music Streaming Platform API is running!');
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/songs', songRouter);
app.use('/api/albums', albumRouter);
app.use('/api/user', userRouter);
app.use('/api/playlists', playlistRouter);
app.use('/api/search', searchRouter);


// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('ERROR:', err);
  
  // Handle multer errors specifically
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
  
  // Make sure to return here too
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});