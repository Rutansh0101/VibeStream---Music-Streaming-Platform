import express from 'express';
import { searchItems } from '../controllers/searchController.js';

const searchRouter = express.Router();

// Public search route
searchRouter.get('/', searchItems);

export default searchRouter;