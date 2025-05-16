import User from '../models/User.js';
import cloudinary from 'cloudinary';
import fs from 'fs';
import songModel from '../models/songModel.js';
import playlistModel from '../models/playlistModel.js';
import albumModel from '../models/albumModel.js';


const extractPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  try {
    const regex = /\/upload\/(?:v\d+\/)?(.+)$/;
    const matches = url.match(regex);
    
    if (matches && matches[1]) {
      return matches[1].replace(/\.\w+$/, '');
    }
  } catch (error) {
    console.error('Error extracting public ID:', error);
  }
  
  return null;
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving profile',
      error: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, bio, phone, location } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use'
        });
      }
      user.email = email;
    }

    if (req.file) {
      try {
        if (user.profileImage) {
          const publicId = extractPublicIdFromUrl(user.profileImage);
          if (publicId) {
            await cloudinary.v2.uploader.destroy(publicId).catch(err => {
              console.log('Failed to delete old image from Cloudinary:', err);
            });
          }
        }
        
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: 'music_platform/profile_images',
          width: 300,
          height: 300,
          crop: 'fill',
          gravity: 'face'
        });
        
        user.profileImage = result.secure_url;
        
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting local file:', err);
        });
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Error uploading profile image',
          error: uploadError.message
        });
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        bio: user.bio,
        isPremium: user.isPremium,
        phone: user.phone,
        location: user.location
      }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.userId;
    
    const [songsCount, playlistsCount, albumsCount] = await Promise.all([
      songModel.countDocuments({ user: userId }),
      playlistModel.countDocuments({ user: userId }),
      albumModel.countDocuments({ user: userId })
    ]);
    
    let mostPopularSong = null;
    try {
      mostPopularSong = await songModel
        .findOne({ user: userId })
        .sort({ plays: -1 })
        .select('name plays image')
        .limit(1);
    } catch (err) {
      console.log('Error fetching most popular song:', err);
    }
    
    let recentPlaylist = null;
    try {
      recentPlaylist = await playlistModel
        .findOne({ user: userId })
        .sort({ createdAt: -1 })
        .select('name songs image')
        .limit(1);
    } catch (err) {
      console.log('Error fetching recent playlist:', err);
    }
    
    return res.status(200).json({
      success: true,
      songsCount,
      playlistsCount,
      albumsCount,
      mostPopularSong,
      recentPlaylist
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    return res.status(500).json({
      success: false, 
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .select('name profilePic bio createdAt');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user data'
    });
  }
};

export const getArtists = async (req, res) => {
  try {
    const artists = await User.find()
      .select('name profilePic bio createdAt')
      .limit(10);
    
    res.status(200).json({
      success: true,
      artists
    });
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artists'
    });
  }
};