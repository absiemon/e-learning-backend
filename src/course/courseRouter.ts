import express from 'express';
import { createCourse, deleteCourse, getAllCourse, getCourse, updateCourse} from './courseController.ts';
import { verifyToken } from '../middleware/verifyToken.ts';

const router = express.Router();

router.post('/create', verifyToken, createCourse);
router.get('/get', getCourse);
router.get('/get-all', verifyToken, getAllCourse);
router.post('/update', updateCourse);
router.delete('/delete', deleteCourse);

export default router;
