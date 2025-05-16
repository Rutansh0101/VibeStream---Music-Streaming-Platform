import songModel from "../models/songModel.js";
import albumModel from "../models/albumModel.js";
import playlistModel from "../models/playlistModel.js";
import User from "../models/User.js";

const searchItems = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query || query.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const searchPattern = new RegExp(query, 'i');

        const songs = await songModel.find({
            $or: [
                { name: searchPattern },
                { desc: searchPattern }
            ]
        }).limit(15).populate({
            path: 'user',
            select: 'name'
        });

        const albums = await albumModel.find({
            $or: [
                { name: searchPattern },
                { desc: searchPattern }
            ]
        }).limit(10).populate({
            path: 'user',
            select: 'name'
        });

        const playlists = await playlistModel.find({
            $and: [
                { 
                    $or: [
                        { name: searchPattern },
                        { desc: searchPattern }
                    ]
                },
                { "songs.0": { $exists: true } }
            ]
        }).limit(10).populate({
            path: 'user',
            select: 'name'
        });

        const artists = await User.find({
            name: searchPattern,
        }).limit(5).select('name _id');

        res.status(200).json({
            success: true,
            results: {
                songs,
                albums,
                playlists,
                artists
            }
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing search'
        });
    }
};

export { searchItems };