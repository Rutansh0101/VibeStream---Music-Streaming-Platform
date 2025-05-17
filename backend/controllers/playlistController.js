import playlistModel from "../models/playlistModel.js";
import songModel from "../models/songModel.js";
import cloudinary from "../config/cloudinary.js";
import fs from 'fs';

const extractPublicIdFromUrl = (url) => {
    if (!url) return null;

    try {
        const regex = new RegExp(`/image/upload/(?:v\\d+/)?(.*?)(?:\\.|$)`);
        const matches = url.match(regex);

        if (matches && matches[1]) {
            return matches[1];
        }
    } catch (error) {
        console.error('Error extracting public ID:', error);
    }

    return null;
};

const createPlaylist = async (req, res) => {
    try {
        console.log("Create playlist request received:", req.body);
        console.log("User ID from auth:", req.userId);
        
        const { name, desc } = req.body;
        let image = '';
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Playlist name is required'
            });
        }

        if (req.file) {
            
            try {
                
                const result = await cloudinary.uploader.upload(req.file.path, {
                    resource_type: "image",
                    folder: 'playlists',
                });
                
                image = result.secure_url;
                
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            } catch (cloudinaryError) {
                console.error("Cloudinary upload error:", cloudinaryError);
                return res.status(400).json({
                    success: false,
                    message: 'Failed to upload image',
                    error: cloudinaryError.message
                });
            }
        }
        
        const playlist = await playlistModel.create({
            name,
            desc: desc || '',
            image: image || null,
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

const addSongToPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { songId } = req.body;
    const userId = req.userId;
    
    if (!songId) {
      return res.status(400).json({
        success: false,
        message: 'Song ID is required'
      });
    }
    
    const playlist = await playlistModel.findOne({ _id: playlistId, user: userId });
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found or you do not have permission to modify it'
      });
    }
    
    const song = await songModel.findById(songId);
    
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }
    
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({
        success: false,
        message: 'Song is already in this playlist'
      });
    }
    
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

const removeSongFromPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.body;
        
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

const deletePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        
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
        
        if (playlist.image) {
            const publicId = extractPublicIdFromUrl(playlist.image);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
            }
        }
        
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

const updatePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, desc } = req.body;
        
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
        
        if (name) playlist.name = name;
        if (desc !== undefined) playlist.desc = desc;
        
        if (req.file) {
            if (playlist.image) {
                const publicId = extractPublicIdFromUrl(playlist.image);
                if (publicId) {
                    try {
                        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
                    } catch (err) {
                        console.error("Error deleting old image:", err);
                    }
                }
            }
            
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    resource_type: "image",
                    folder: 'playlists',
                });
                
                playlist.image = result.secure_url;
                
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            } catch (cloudinaryError) {
                console.error("Cloudinary upload error:", cloudinaryError);
                return res.status(400).json({
                    success: false,
                    message: 'Failed to upload image',
                    error: cloudinaryError.message
                });
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

const getPublicPlaylists = async (req, res) => {
    try {
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