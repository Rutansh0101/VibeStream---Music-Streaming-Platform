import express from 'express';
import { addAlbum, listAlbum, getUserAlbums, removeAlbum, getAlbumById } from '../controllers/albumController.js';
import upload from '../middlewares/multer.js';
import { protect } from '../middlewares/authMiddleware.js';

const albumRouter = express.Router();

albumRouter.get('/list', listAlbum);
albumRouter.get('/:id', getAlbumById);

albumRouter.post('/add', protect, upload.single('image'), addAlbum);
albumRouter.get('/user/albums', protect, getUserAlbums);
albumRouter.post('/remove', protect, removeAlbum);

export default albumRouter;