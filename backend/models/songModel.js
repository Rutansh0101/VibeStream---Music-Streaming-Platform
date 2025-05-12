import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        required: true,
    },
    album: {
        type: mongoose.Schema.Types.Mixed, // Can be ObjectId or String
        required: true
    },
    image: {
        type: String,
        required: true,
    },
    file: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const songModel = mongoose.model('Song', songSchema);
export default songModel;