import express from 'express';
import { createReview, getReviews, updateReview, deleteReview } from './reviewController.ts';
import { verifyToken } from '../middleware/verifyToken.ts';

const router = express.Router();

router.post('/create',  verifyToken, createReview);
router.get('/get-all',  getReviews);
router.put('/:id', verifyToken,  updateReview);
router.delete('/:id', verifyToken,  deleteReview);

export default router;