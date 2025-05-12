import { addSong, listSong, getUserSongs, removeSong, getSongById } from "../controllers/songController.js";
import express from "express";
import upload from "../middlewares/multer.js";
import { protect } from "../middlewares/authMiddleware.js";

const songRouter = express.Router();

// Protected routes - require authentication
songRouter.post('/add', protect, upload.fields([{name: "image", maxCount: 1}, {name: "audio", maxCount: 1}]), addSong);
songRouter.get('/user-songs', protect, getUserSongs);
songRouter.post('/remove', protect, removeSong);

// Public routes - anyone can access
songRouter.get('/list', listSong);  // Define specific routes FIRST

// Parameter route should come LAST
songRouter.get('/:id', getSongById); // This should always be last

export default songRouter;