import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    desc: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    genre: {
        type: String,
        required: true,
        enum: ['pop', 'rock', 'hiphop', 'rnb', 'electronic', 'jazz', 'classical', 'country', 'other']
    },
    releaseDate: {
        type: Date,
        required: true
    },
    bgColor: {
        type: String,
        default: "#121212"
    },
    image: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }]
}, { timestamps: true });

const albumModel = mongoose.model('Album', albumSchema);
export default albumModel;