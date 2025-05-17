import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const connectCloudinary = () => {
    console.log("Cloudinary configuration loaded successfully");
    return true;
}

export { connectCloudinary };
export default cloudinary;