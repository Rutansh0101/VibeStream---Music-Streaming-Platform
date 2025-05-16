import {v2 as cloudinary} from 'cloudinary';
import albumModel from '../models/albumModel.js';
import fs from 'fs';


const generateBgColor = () => {
    const colors = [
        "#121212", "#1E1E1E", "#2D142C", "#391306", 
        "#0A1828", "#162447", "#1B263B", "#480032", 
        "#2B2D42", "#141414", "#1C2331", "#251605"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

const addAlbum = async (req, res) => {
    try {
        const {name, desc, genre, releaseDate} = req.body;
        const imageFile = req.file;
        
        if(!name || !desc || !genre || !releaseDate) {
            return res.status(400).json({success: false, message: 'Please fill all the required fields'});
        }

        if (!imageFile) {
            return res.status(400).json({success: false, message: 'Please upload an album cover image'});
        }

        if (!req.userId && !req.user?._id) {
            return res.status(401).json({
                success: false, 
                message: 'Authentication error - user not identified'
            });
        }

        const userId = req.userId || req.user._id;
        const bgColor = generateBgColor();

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: 'image',
            folder: 'album_covers',
        });

        const albumData = {
            name,
            desc,
            genre,
            releaseDate,
            bgColor,
            image: imageUpload.secure_url,
            user: userId,
            songs: []
        };

        const album = await albumModel.create(albumData);

        if (fs.existsSync(imageFile.path)) {
            fs.unlinkSync(imageFile.path);
        }

        if (album) {
            return res.status(201).json({
                success: true,
                message: 'Album created successfully',
                album: {
                    id: album._id,
                    name: album.name,
                    desc: album.desc,
                    genre: album.genre,
                    releaseDate: album.releaseDate,
                    bgColor: album.bgColor,
                    image: album.image,
                    createdAt: album.createdAt
                }
            });
        } else {
            return res.status(400).json({success: false, message: 'Failed to create album'});
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
};

const listAlbum = async (req, res) => {
    try {
        const albums = await albumModel.find()
            .sort({ createdAt: -1 })
            .populate('user', 'name email profileImage');
            
        return res.status(200).json({
            success: true,
            message: 'Albums fetched successfully',
            albums
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
};

const getUserAlbums = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const userAlbums = await albumModel.find({ user: userId })
            .sort({ createdAt: -1 });
            
        return res.status(200).json({
            success: true,
            message: 'User albums fetched successfully',
            albums: userAlbums
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
};

const removeAlbum = async (req, res) => {
    try {
        const {id} = req.body;
        
        if (!id) {
            return res.status(400).json({success: false, message: 'Please provide an album id'});
        }

        const album = await albumModel.findById(id);
        
        if (!album) {
            return res.status(404).json({success: false, message: 'Album not found'});
        }

        if (album.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({success: false, message: 'You do not have permission to delete this album'});
        }

        const imageUrl = album.image;
        const splitUrl = imageUrl.split('/');
        const publicIdWithExtension = splitUrl[splitUrl.length - 1];
        const publicId = `album_covers/${publicIdWithExtension.split('.')[0]}`;

        await cloudinary.uploader.destroy(publicId);

        const deletedAlbum = await albumModel.findByIdAndDelete(id);
        
        if (deletedAlbum) {
            return res.status(200).json({
                success: true,
                message: 'Album deleted successfully',
                album: deletedAlbum
            });
        } else {
            return res.status(400).json({success: false, message: 'Failed to delete album'});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
};

const getAlbumById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const album = await albumModel.findById(id)
            .populate('user', 'name email profileImage')
            .populate('songs');
            
        if (!album) {
            return res.status(404).json({success: false, message: 'Album not found'});
        }
        
        return res.status(200).json({
            success: true,
            message: 'Album fetched successfully',
            album
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
};

export { addAlbum, listAlbum, getUserAlbums, removeAlbum, getAlbumById };