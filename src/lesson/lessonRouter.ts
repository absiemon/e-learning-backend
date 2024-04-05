import express from 'express';
import { createLesson, getAllLessons, updateLesson, deleteLesson } from './lessonController.ts';
import { verifyToken } from '../middleware/verifyToken.ts';

const router = express.Router();

router.post('/create', verifyToken, createLesson);
router.get('/get-all', verifyToken, getAllLessons);
router.put('/:id', verifyToken, updateLesson);
router.delete('/delete', verifyToken, deleteLesson);

export default router;