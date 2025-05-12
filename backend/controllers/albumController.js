import {v2 as cloudinary} from 'cloudinary';
import albumModel from '../models/albumModel.js';
import fs from 'fs';

// Helper function to generate a background color based on the image
const generateBgColor = () => {
    // Generate a random dark color suitable for album background
    const colors = [
        "#121212", "#1E1E1E", "#2D142C", "#391306", 
        "#0A1828", "#162447", "#1B263B", "#480032", 
        "#2B2D42", "#141414", "#1C2331", "#251605"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

// Add a new album
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

        // Make sure we have a user ID (should be set by auth middleware)
        if (!req.userId && !req.user?._id) {
            return res.status(401).json({
                success: false, 
                message: 'Authentication error - user not identified'
            });
        }
        
        // Use either req.userId or req.user._id
        const userId = req.userId || req.user._id;

        // Generate a background color based on the image or use a random one
        const bgColor = generateBgColor();

        // Upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: 'image',
            folder: 'album_covers',
        });

        // Create album with user reference
        const albumData = {
            name,
            desc,
            genre,
            releaseDate,
            bgColor,
            image: imageUpload.secure_url,
            user: userId, // Use the determined userId
            songs: []
        };

        const album = await albumModel.create(albumData);

        // Clean up the temporary file
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

// List all albums
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

// Get albums by current user
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

// Remove an album
const removeAlbum = async (req, res) => {
    try {
        const {id} = req.body;
        
        if (!id) {
            return res.status(400).json({success: false, message: 'Please provide an album id'});
        }

        // Find the album
        const album = await albumModel.findById(id);
        
        if (!album) {
            return res.status(404).json({success: false, message: 'Album not found'});
        }
        
        // Check if user owns this album
        if (album.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({success: false, message: 'You do not have permission to delete this album'});
        }
        
        // Extract public ID from cloudinary URL
        const imageUrl = album.image;
        const splitUrl = imageUrl.split('/');
        const publicIdWithExtension = splitUrl[splitUrl.length - 1];
        const publicId = `album_covers/${publicIdWithExtension.split('.')[0]}`;
        
        // Delete image from cloudinary
        await cloudinary.uploader.destroy(publicId);
        
        // Delete album from database
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

// Get album by ID
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