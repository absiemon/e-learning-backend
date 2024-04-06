import express from 'express';
import { createVideo, updateVideo, deleteVideo } from './videoController.ts';
import { verifyToken } from '../middleware/verifyToken.ts';

const router = express.Router();

router.post('/create', verifyToken, createVideo);
router.put('/update/:id', verifyToken, updateVideo);
router.delete('/delete', verifyToken, deleteVideo);

export default router;