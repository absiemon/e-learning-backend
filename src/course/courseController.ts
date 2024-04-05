
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RequestWithUser } from '../middleware/verifyToken.ts';
import { createCourseRequestType } from './types.ts';

const prisma = new PrismaClient();

// API to Create Course
export const createCourse = async (req: RequestWithUser, res: Response) => {
    const { title, description, category } = req.body as createCourseRequestType;

    try {
        // Check if course title already exists
        const existingCourse = await prisma.course.findFirst({
            where: {
                title: title,
            },
        });

        if (existingCourse) {
            return res.status(400).json({ error: 'Course title already exists' });
        }

        //getting the user id(course creator) after token verification.
        const user_id  = req.user?.id as string;

        // Create the course
        const newCourse = await prisma.course.create({
            data: {
                title: title,
                description: description,
                category: category,
                user: { connect: { id: user_id } }
            },
        });

        return res.status(201).json(newCourse);
    } catch (error) {
        console.error('Error creating course:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// API to get a single Course
export const getCourse = async (req: Request, res: Response) => {
    const courseId = req.params.id;

    try {
        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
            },
            include: {
                user: true // Including the user details
            }
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        return res.status(200).json(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// API to get all the Course created by the user.
export const getAllCourse = async (req: RequestWithUser, res: Response) => {
    const user_id = req.user?.id as string;

    try {
        const courses = await prisma.course.findMany({
            where: {
                user_id: user_id,
            },
            include: {
                user: true
            }
        });
        
        return res.status(200).json(courses);
    } catch (error) {
        console.error('Error fetching course:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


// API to Update Course
export const updateCourse = async (req: Request, res: Response) => {
    const courseId = req.params.id;
    const data = req.body;
    try {
        const updatedCourse = await prisma.course.update({
            where: {
                id: courseId,
            },
            data: {
               ...data
            },
        });

        return res.status(200).json(updatedCourse);
    } catch (error) {
        console.error('Error updating course:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// API to Delete a Course
export const deleteCourse = async (req: Request, res: Response) => {
    const courseId = req.params.id;

    try {
        await prisma.course.delete({
            where: {
                id: courseId,
            },
        });

        return res.status(204).send();
    } catch (error) {
        console.error('Error deleting course:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
