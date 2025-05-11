import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import songRouter from './routes/songRoutes.js';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import albumRouter from './routes/albumRoutes.js';

// app config:
const app = express();
const PORT = process.env.PORT || 4000;
connectDB();
connectCloudinary();


// Middlewares:
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended: true}));


// initializing routes:
app.get('/', (req, res)=>{
    res.send('Welcome to the backend baby!');
});

// Importing routes:
app.use('/api/song', songRouter);
app.use('/api/album', albumRouter);

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
})