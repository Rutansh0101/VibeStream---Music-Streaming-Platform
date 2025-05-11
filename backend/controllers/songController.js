import songModel from "../models/songModel.js";
import { v2 as cloudinary } from 'cloudinary';

const addSong = async(req, res) => {
    try{
        const name = req.body.name;
        const desc = req.body.desc;
        const album = req.body.album;
        const audioFile = req.files.audio[0];
        const imageFile = req.files.image[0];

        if(!name || !desc || !album || !audioFile || !imageFile){
            return res.status(400).json({message: "Please fill all the fields"});
        }

        const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
            resource_type: "video",
            folder: "songs/audio",
        });
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: "image",
            folder: "songs/image",
        });
        const duration = `Math.floor(audioUpload.duration / 60):${Math.floor(audioUpload.duration % 60)}`;

        const songData = {
            name: name,
            desc: desc,
            album: album,
            image: imageUpload.secure_url,
            file: audioUpload.secure_url,
            duration,
        };

        const song = await songModel.create(songData);

        if(!song){
            return res.status(400).json({message: "Song not added"});
        }

        res.status(200).json({
            message: "Song added successfully",
            song: {
                name: song.name,
                desc: song.desc,
                album: song.album,
                image: song.image,
                file: song.file,
                duration: song.duration,
            }
        });

        // Deleting the files from the server:
        const fs = require('fs');
        fs.unlink(audioFile.path, (err) => {
            if(err){
                console.log(err);
            }
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({message: "Internal server error"});
    }
}

const listSong = async(req, res) => {
    try {
        const allSongs = await songModel.find();
        if(allSongs.length === 0){
            return res.status(400).json({message: "No songs found"});
        }
        res.status(200).json({
            message: "Songs found",
            songs: allSongs,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error"});
    }
}

const removeSong = async(req, res) => {
    try {
        await songModel.findByIdAndDelete(req.body.id);
        res.status(200).json({message: "Song deleted successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error"});
    }
}

export {addSong, listSong, removeSong};