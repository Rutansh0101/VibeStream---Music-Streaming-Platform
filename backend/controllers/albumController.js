import {v2 as cloudinary} from 'cloudinary';
import albumModel from '../models/albumModel.js';

const addAlbum = async (req, res) => {
    try {
        const {name, desc, bgColor} = req.body;
        const imageFile = req.file;
        
        if(!name || !desc || !bgColor) {
            return res.status(400).json({message: 'Please fill all the fields'});
        }
        if (!imageFile) {
            return res.status(400).json({message: 'Please upload an image'});
        }

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: 'image',
            folder: 'album',
        });

        const albumData = {
            name,
            desc,
            bgColor,
            image: imageUpload.secure_url
        }

        const album = await albumModel.create(albumData);

        if (album) {
            return res.status(201).json({
                message: 'Album created successfully',
                album
            });
        } else {
            return res.status(400).json({message: 'Failed to create album'});
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error'});
    }
}

const listAlbum = async (req, res) => {
    try {
        const albums = await albumModel.find();
        if (albums) {
            return res.status(200).json({
                message: 'Albums fetched successfully',
                albums
            });
        } else {
            return res.status(400).json({message: 'Failed to fetch albums'});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error'});
    }
}

const removeAlbum = async (req, res) => {
    try {
        const {id} = req.body;
        if (!id) {
            return res.status(400).json({message: 'Please provide an id'});
        }

        const album = await albumModel.findByIdAndDelete(id);
        if (album) {
            return res.status(200).json({
                message: 'Album deleted successfully',
                album
            });
        } else {
            return res.status(400).json({message: 'Failed to delete album'});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error'});
    }
}

export { addAlbum, listAlbum, removeAlbum };