import express from 'express';
import { createCourse, deleteCourse, getAllCourse, getAllAvailableCourse, getCourse, updateCourse} from './courseController.ts';
import { verifyToken } from '../middleware/verifyToken.ts';

const router = express.Router();

router.post('/create', verifyToken, createCourse);
router.get('/get/:id', verifyToken, getCourse);
router.get('/get-all/created', verifyToken, getAllCourse);
router.get('/get-all', getAllAvailableCourse);
router.post('/update/:id', verifyToken, updateCourse);
router.delete('/delete/:id', verifyToken, deleteCourse);

export default router;
