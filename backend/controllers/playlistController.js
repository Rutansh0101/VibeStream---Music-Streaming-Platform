import playlistModel from "../models/playlistModel.js";
import songModel from "../models/songModel.js";
import cloudinary from "../config/cloudinary.js";
import fs from 'fs';

// Create a new playlist
const createPlaylist = async (req, res) => {
    try {
        console.log("Create playlist request received:", req.body);
        console.log("User ID from auth:", req.userId);
        
        const { name, desc } = req.body;
        let image = '';
        
        // Check if we have the required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Playlist name is required'
            });
        }

        // Check if image file was uploaded
        if (req.file) {
            console.log("Image file received:", req.file.path);
            
            try {
                // Upload image to Cloudinary
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'playlists',
                });
                
                image = result.secure_url;
                console.log("Image uploaded to Cloudinary:", image);
                
                // Remove the uploaded file
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            } catch (cloudinaryError) {
                console.error("Cloudinary upload error:", cloudinaryError);
                // Continue without image if Cloudinary fails
            }
        }
        
        // Create playlist with user ID from auth middleware
        const playlist = await playlistModel.create({
            name,
            desc: desc || '',
            image: image || undefined, // Use default if not uploaded
            user: req.userId,
            songs: []
        });
        
        console.log("Playlist created successfully:", playlist._id);
        
        res.status(201).json({
            success: true,
            message: 'Playlist created successfully',
            playlist
        });
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create playlist',
            error: error.message
        });
    }
};

// Get all playlists for the current user
const getUserPlaylists = async (req, res) => {
    try {
        const playlists = await playlistModel.find({ user: req.userId })
            .populate({
                path: 'songs',
                select: 'name image'
            });
        
        res.status(200).json({
            success: true,
            playlists
        });
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch playlists'
        });
    }
};

// Get a single playlist by ID
const getPlaylistById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const playlist = await playlistModel.findById(id)
            .populate({
                path: 'songs',
                select: 'name image file duration desc createdAt'
            })
            .populate({
                path: 'user',
                select: 'name'
            });
        
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist not found'
            });
        }
        
        res.status(200).json({
            success: true,
            playlist
        });
    } catch (error) {
        console.error('Error fetching playlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch playlist'
        });
    }
};

// Add a song to a playlist
const addSongToPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { songId } = req.body;
    const userId = req.userId; // From auth middleware
    
    if (!songId) {
      return res.status(400).json({
        success: false,
        message: 'Song ID is required'
      });
    }
    
    // Check if playlist exists and belongs to user
    const playlist = await playlistModel.findOne({ _id: playlistId, user: userId });
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found or you do not have permission to modify it'
      });
    }
    
    // Check if song exists
    const song = await songModel.findById(songId);
    
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }
    
    // Check if song is already in the playlist
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({
        success: false,
        message: 'Song is already in this playlist'
      });
    }
    
    // Add song to playlist
    playlist.songs.push(songId);
    await playlist.save();
    
    res.status(200).json({
      success: true,
      message: 'Song added to playlist successfully',
      playlist
    });
    
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add song to playlist',
      error: error.message
    });
  }
};

// Remove a song from a playlist
const removeSongFromPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.body;
        
        // Check if playlist exists and belongs to user
        const playlist = await playlistModel.findOne({
            _id: playlistId,
            user: req.userId
        });
        
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist not found or unauthorized'
            });
        }
        
        // Remove song from playlist
        playlist.songs = playlist.songs.filter(song => song.toString() !== songId);
        await playlist.save();
        
        res.status(200).json({
            success: true,
            message: 'Song removed from playlist',
            playlist
        });
    } catch (error) {
        console.error('Error removing song from playlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove song from playlist'
        });
    }
};

// Delete a playlist
const deletePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if playlist exists and belongs to user
        const playlist = await playlistModel.findOne({
            _id: id,
            user: req.userId
        });
        
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist not found or unauthorized'
            });
        }
        
        // Delete playlist image from Cloudinary if it exists
        if (playlist.image && !playlist.image.includes('default-playlist')) {
            const publicId = playlist.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`playlists/${publicId}`);
        }
        
        // Delete playlist
        await playlistModel.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'Playlist deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting playlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete playlist'
        });
    }
};

// Update playlist details
const updatePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, desc } = req.body;
        
        // Check if playlist exists and belongs to user
        const playlist = await playlistModel.findOne({
            _id: id,
            user: req.userId
        });
        
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist not found or unauthorized'
            });
        }
        
        // Update fields if provided
        if (name) playlist.name = name;
        if (desc !== undefined) playlist.desc = desc;
        
        // Check if image file was uploaded
        if (req.file) {
            // Delete old image from Cloudinary if it exists
            if (playlist.image && !playlist.image.includes('default-playlist')) {
                const publicId = playlist.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`playlists/${publicId}`);
            }
            
            // Upload new image to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'playlists',
            });
            
            playlist.image = result.secure_url;
            
            // Remove the uploaded file
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
        
        await playlist.save();
        
        res.status(200).json({
            success: true,
            message: 'Playlist updated successfully',
            playlist
        });
    } catch (error) {
        console.error('Error updating playlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update playlist'
        });
    }
};

// Get public playlists (for discovery)
const getPublicPlaylists = async (req, res) => {
    try {
        // Get most recent playlists with at least one song
        const playlists = await playlistModel.find({ 
            "songs.0": { $exists: true } 
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate({
            path: 'user',
            select: 'name'
        });
        
        res.status(200).json({
            success: true,
            playlists
        });
    } catch (error) {
        console.error('Error fetching public playlists:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch public playlists'
        });
    }
};

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    updatePlaylist,
    getPublicPlaylists
};