import express from 'express';
import authRouter from './auth/userRouter.ts';
import courseRouter from './course/courseRouter.ts';
import reviewRouter from './reviews/reviewRouter.ts';

const router = express.Router();

router.use('/auth', authRouter);

router.use('/course', courseRouter);

router.use('/review', reviewRouter);

router.use('/lesson', reviewRouter);

router.use('/video', reviewRouter);

export default router;
