import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RequestWithUser } from '../middleware/verifyToken.ts';

const prisma = new PrismaClient();

// API to enroll in a course Course
export const enrollInCourse = async (req: RequestWithUser, res: Response) => {
    const { course_id} = req.body;
    try {
        //getting the user id after token verification
        const user_id = req.user?.id as string;

        //check if the user id and course id are there
        if(!course_id || !user_id){
            return res.status(400).json({error: "user id and course id is required!"});
        }
        //check if the user is already enrolled in the course
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                user_id: user_id,
                course_id: course_id,
            }
        })

        if(enrollment){
            return res.status(400).json({error: "You are already enrolled in this course!"});
        }
        
        //create the enrollment
        await prisma.enrollment.create({
            data: {
                user: { connect: { id: user_id } },
                course: { connect: { id: course_id } },
            },
        });
        return res.status(200).json({message: "Successfully enrolled in the course!"});

    } catch (error) {
        console.error('Error deleting video:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

//Api to get all the enrollments by the user
export const getAllEnrolledCourse = async (req: RequestWithUser, res: Response) => {
    try {
        //getting the user id after token verification
        const user_id = req.user?.id as string;

        //getting all the enrollments for the user
        const enrollments = await prisma.enrollment.findMany({
            where: {
                user_id: user_id,
            },
            include: {
                course: true,
                user: true,
            }
        });
        return res.status(200).json(enrollments);
    } catch (error) {
        console.error('Error deleting video:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


//Api to get all the enrolled user for a course
export const getAllUserEnrolledInCourse = async (req: Request, res: Response) => {
    const course_id = req.query.course_id as string;
    try {
        //check if the user id and course id are there
        if(!course_id){
            return res.status(400).json({error: "course id is required!"});
        }

        //getting all the enrollments for the user
        const usersEnrolled = await prisma.enrollment.findMany({
            where: {
                course_id: course_id,
            },
            include: {
                course: true,
                user: true,
            }
        });
        return res.status(200).json(usersEnrolled);
    } catch (error) {
        console.error('Error deleting video:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

