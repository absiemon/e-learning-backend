import express from 'express';
import { enrollInCourse, getAllEnrolledCourse, getAllUserEnrolledInCourse} from './enrollmentController.ts';
import { verifyToken } from '../middleware/verifyToken.ts';

const router = express.Router();

router.post('/enroll', verifyToken, enrollInCourse);
router.get('/all-courses', verifyToken, getAllEnrolledCourse);
router.get('/all-users', getAllUserEnrolledInCourse);

export default router;
