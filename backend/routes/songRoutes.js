import { addSong, listSong, getUserSongs, removeSong, getSongById, getSongsByUserId } from "../controllers/songController.js";
import express from "express";
import upload from "../middlewares/multer.js";
import { protect } from "../middlewares/authMiddleware.js";

const songRouter = express.Router();

songRouter.post('/add', protect, upload.fields([{name: "image", maxCount: 1}, {name: "audio", maxCount: 1}]), addSong);
songRouter.get('/user-songs', protect, getUserSongs);
songRouter.post('/remove', protect, removeSong);

songRouter.get('/list', listSong);

songRouter.get('/:id', getSongById);

songRouter.get('/by-user/:userId', getSongsByUserId);

export default songRouter;