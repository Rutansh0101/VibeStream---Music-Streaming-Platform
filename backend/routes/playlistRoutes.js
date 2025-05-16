import express from 'express';
import { 
    createPlaylist, 
    getUserPlaylists, 
    getPlaylistById, 
    addSongToPlaylist, 
    removeSongFromPlaylist, 
    deletePlaylist, 
    updatePlaylist, 
    getPublicPlaylists 
} from '../controllers/playlistController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/multer.js';

const playlistRouter = express.Router();

playlistRouter.post('/create', protect, upload.single('image'), createPlaylist);
playlistRouter.get('/user', protect, getUserPlaylists);
playlistRouter.post('/:playlistId/add-song', protect, addSongToPlaylist);
playlistRouter.post('/remove-song', protect, removeSongFromPlaylist);
playlistRouter.delete('/:id', protect, deletePlaylist);
playlistRouter.put('/:id', protect, upload.single('image'), updatePlaylist);

playlistRouter.get('/public', getPublicPlaylists);
playlistRouter.get('/:id', getPlaylistById);

export default playlistRouter;