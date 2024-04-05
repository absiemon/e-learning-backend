import express from 'express';
import { registerUser, loginUser, updateUser } from './userController.ts';
import { verifyToken } from '../middleware/verifyToken.ts';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/update/profile', verifyToken, updateUser);

export default router;
