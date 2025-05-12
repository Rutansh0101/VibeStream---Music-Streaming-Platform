import songModel from "../models/songModel.js";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import albumModel from "../models/albumModel.js";

// Helper function to extract Cloudinary public ID from URL
const extractPublicIdFromUrl = (url, isAudio = false) => {
    if (!url) return null;

    try {
        // Cloudinary URLs typically look like:
        // https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/folder/public_id.jpg
        // or for audio:
        // https://res.cloudinary.com/your_cloud_name/video/upload/v1234567890/folder/public_id.mp3
        const resourceType = isAudio ? 'video' : 'image';
        const regex = new RegExp(`/${resourceType}/upload/(?:v\\d+/)?(.*?)(?:\\.|$)`);
        const matches = url.match(regex);

        if (matches && matches[1]) {
            return matches[1];
        }
    } catch (error) {
        console.error('Error extracting public ID:', error);
    }

    return null;
};

// Add a new song
const addSong = async (req, res) => {
    try {
        const { name, desc, album } = req.body;
        const audioFile = req.files.audio[0];
        const imageFile = req.files.image[0];

        if (!name || !desc || !album || !audioFile || !imageFile) {
            return res.status(400).json({ success: false, message: "Please fill all the fields" });
        }

        // Upload audio file to Cloudinary
        const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
            resource_type: "video",
            folder: "songs/audio",
        });

        // Upload image file to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: "image",
            folder: "songs/image",
        });

        // Format duration as mm:ss
        const minutes = Math.floor(audioUpload.duration / 60);
        const seconds = Math.floor(audioUpload.duration % 60);
        const duration = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

        // Create song data with user reference
        const songData = {
            name,
            desc,
            album,
            image: imageUpload.secure_url,
            file: audioUpload.secure_url,
            duration,
            user: req.userId // From auth middleware
        };

        const song = await songModel.create(songData);

        if (!song) {
            return res.status(400).json({ success: false, message: "Song not added" });
        }

        // If song belongs to an album (not "none"), update the album
        if (album !== "none") {
            try {
                // Find the album and add this song to its songs array
                await albumModel.findByIdAndUpdate(
                    album,
                    { $push: { songs: song._id } },
                    { new: true }
                );
            } catch (albumError) {
                console.error("Error updating album with song:", albumError);
                // We continue even if album update fails, because song was created successfully
            }
        }

        // Clean up local files after upload
        if (fs.existsSync(audioFile.path)) fs.unlinkSync(audioFile.path);
        if (fs.existsSync(imageFile.path)) fs.unlinkSync(imageFile.path);

        res.status(201).json({
            success: true,
            message: "Song added successfully",
            song: {
                id: song._id,
                name: song.name,
                desc: song.desc,
                album: song.album,
                image: song.image,
                file: song.file,
                duration: song.duration,
                createdAt: song.createdAt
            }
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Get all songs
const listSong = async (req, res) => {
    try {
        // Try with simpler query without sorting if there's an issue
        const allSongs = await songModel.find().limit(10);
        
        res.status(200).json({
            success: true,
            message: "Songs fetched successfully",
            songs: allSongs,
        });
    } catch (error) {
        console.error("Error in listSong controller:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Get songs uploaded by the current user
const getUserSongs = async (req, res) => {
    try {
        const userSongs = await songModel.find({ user: req.userId })
            .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json({
            success: true,
            message: "User songs fetched successfully",
            songs: userSongs,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Remove a song
const removeSong = async (req, res) => {
    try {
        const { id } = req.body;

        // Find the song
        const song = await songModel.findById(id);

        if (!song) {
            return res.status(404).json({
                success: false,
                message: "Song not found"
            });
        }

        // Check if the user is the owner of the song
        if (song.user.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to delete this song"
            });
        }

        // Delete files from Cloudinary
        const audioPublicId = extractPublicIdFromUrl(song.file, true);
        const imagePublicId = extractPublicIdFromUrl(song.image);

        // Array to hold deletion promises
        const deletionPromises = [];

        if (audioPublicId) {
            deletionPromises.push(
                cloudinary.uploader.destroy(audioPublicId, { resource_type: "video" })
                    .catch(error => {
                        console.error("Error deleting audio from Cloudinary:", error);
                        throw new Error("Failed to delete audio file");
                    })
            );
        }

        if (imagePublicId) {
            deletionPromises.push(
                cloudinary.uploader.destroy(imagePublicId)
                    .catch(error => {
                        console.error("Error deleting image from Cloudinary:", error);
                        throw new Error("Failed to delete image file");
                    })
            );
        }

        if (song.album && song.album !== "none") {
            try {
                await albumModel.findByIdAndUpdate(
                    song.album,
                    { $pull: { songs: song._id } },
                    { new: true }
                );
            } catch (albumError) {
                console.error("Error removing song from album:", albumError);
                // We continue with song deletion even if this fails
            }
        }

        // Wait for all Cloudinary deletions to complete
        await Promise.all(deletionPromises);

        // Delete song from database
        await songModel.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Song deleted successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
}

const getSongById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const song = await songModel.findById(id);
    
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Song retrieved successfully',
      song
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getSongsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const songs = await songModel.find({ user: userId })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      songs
    });
  } catch (error) {
    console.error('Error fetching user songs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch songs'
    });
  }
};

export { addSong, listSong, getUserSongs, removeSong, getSongById, getSongsByUserId };