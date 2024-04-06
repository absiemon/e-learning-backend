import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createLessonReqType } from './type';
import { RequestWithUser } from '../middleware/verifyToken.ts';

const prisma = new PrismaClient();

export const areYouACreatorOfThisCourse = async (user_id: string, course_id: string): Promise<boolean> => {
    const course = await prisma.course.findUnique({
        where: {
            id: course_id,
        },
    });
    if (course?.user_id !== user_id) {
        return false;
    }
    return true
}

//Api to create a lesson for a particular course
export const createLesson = async (req: RequestWithUser, res: Response) => {
    const data: createLessonReqType = req.body;
    const course_id = req.query.course_id as string;

    try {
        //checking if course is given or not
        if (!course_id) {
            return res.status(400).json({ error: "course_id is required" });
        }

        //you can only create lesson if you are the creator of the course
        const user_id = req.user?.id as string;
        if(!await areYouACreatorOfThisCourse(user_id, course_id)){
            return res.status(400).json({error: "you are not authorize to create lesson!"});
        }

        //checking whether the given lesson number is already created for this course
        const existingLession = await prisma.lesson.findFirst({
            where: {
                course_id: course_id,
                lesson_number: data.lesson_number,
            }
        })
        if (existingLession) {
            return res.status(400).json({ error: "The lesson for the course already exists!" });
        }

        //if all check passed then create a lesson for a course
        const newLession = await prisma.lesson.create({
            data: {
                ...data,
                course: { connect: { id: course_id } }
            },
        });

        return res.status(201).json(newLession);
    } catch (error) {

        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

//Api to get all the lesson for a course sort by lesson number in increasing order
export const getAllLessons = async (req: RequestWithUser, res: Response) => {
    const course_id = req.query.course_id as string;

    try {
        //checking if course is given or not
        if (!course_id) {
            return res.status(400).json({ error: "course_id is required" });
        }

        //you can only get all lessons if you are the creator of the course
        const user_id = req.user?.id as string;
        if(!await areYouACreatorOfThisCourse(user_id, course_id)){
            return res.status(400).json({error: "you are not the authorize to get the lessons."});
        }

        //get all the lesson for a given course id sort by lesson number in increasing order
        const lessons = await prisma.lesson.findMany({
            where: {
                course_id: course_id,
            },
            orderBy: {
                lesson_number: 'asc'
            }
        });

        return res.status(200).json(lessons)

    } catch (error) {
        
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
}

//api to edit the lesson description. For now no way to update lesson number 
export const updateLesson = async (req: RequestWithUser, res: Response) => {
    const lesson_id = req.params.id;
    const { description, course_id } = req.body;

    try {
        //checking if course is given or not
        if (!lesson_id) {
            return res.status(400).json({ error: "lesson id is required" });
        }

        //you can only update lesson if you are the creator of the course
        const user_id = req.user?.id as string;

        if(!await areYouACreatorOfThisCourse(user_id, course_id)){
            return res.status(400).json({error: "you are not the authorize to update the lessons."});
        }

        //if all check passed then update the lesson
        await prisma.lesson.update({
            where: {
                id: lesson_id,
            },
            data: {
                description: description,
            },
        });

        return res.status(200).json({ message: "Successfully updated lesson description" });
    } catch (error) {

        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};


//Api to delete a lesson
export const deleteLesson = async (req: RequestWithUser, res: Response) => {
    const lesson_id = req.query.lesson_id as string;
    const course_id = req.query.course_id as string;

    try {
        //checking if course is given or not
        if (!lesson_id || !course_id) {
            return res.status(400).json({ error: "lesson id and course id is required" });
        }

        //you can only delete lesson if you are the creator of the course
        const user_id = req.user?.id as string;
                
        if(!await areYouACreatorOfThisCourse(user_id, course_id)){
            return res.status(400).json({error: "you are not the authorize to delete the lessons."});
        }

        //if all check passed then delete the lesson
        await prisma.lesson.delete({
            where: {
                id: lesson_id,
            },
        });

        //if a lesson is deleted then also delete the videos of that lesson
        await prisma.video.deleteMany({
            where: {
                lesson_id: lesson_id,
            },
        });

        return res.status(200).json({ message: "Successfully deleted the lesson!" });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
}