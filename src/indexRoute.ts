import express from 'express';
import authRouter from './auth/userRouter.ts';
import courseRouter from './course/courseRouter.ts';
import reviewRouter from './reviews/reviewRouter.ts';
import lessonRouter from './lesson/lessonRouter.ts';
import videoRouter from './video/videoRouter.ts';
import enrollmentRouter from './enrollment/enrollmentRouter.ts';

const router = express.Router();

router.use('/auth', authRouter);

router.use('/course', courseRouter);

router.use('/review', reviewRouter);

router.use('/lesson', lessonRouter);

router.use('/video', videoRouter);

router.use('/enrollment', enrollmentRouter);

export default router;
