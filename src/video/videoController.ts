import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createVideoReqType, updateVideoReqType } from './type.ts';
import { RequestWithUser } from '../middleware/verifyToken.ts';
import { areYouACreatorOfThisCourse } from '../lesson/lessonController.ts';

const prisma = new PrismaClient();

// Api to create a video for a course and a lesson 
export const createVideo = async (req: RequestWithUser, res: Response) => {
    const { description, poster_url, video_url, video_number, lesson_id, course_id } = req.body as createVideoReqType;

    try {
        //check if the lesson id and course id are there
        if(!lesson_id || !course_id){
            return res.status(400).json({error: "lesson id and course id is required"});
        }
         //you can only create video for this lesson if you are the creator of the course
         const user_id = req.user?.id as string;
         if(!await areYouACreatorOfThisCourse(user_id, course_id)){
             return res.status(400).json({error: "you are not the authorize to create video for this lesson."});
         }

         //checking if the video number already created for this lesson
         const existingVideo = await prisma.video.findFirst({
             where:{
                 video_number: video_number,
                 lesson_id: lesson_id,
             },
         });

         if(existingVideo){
            return res.status(400).json({error: "The video number for the lesson already exists!"});
         }

        //creating video
        const newVideo = await prisma.video.create({
            data: {
                description: description,
                poster_url: poster_url,
                video_url: video_url,
                video_number: video_number,
                lesson: { connect: { id: lesson_id } },
                course: { connect: { id: course_id } }
            },
        });

        return res.status(201).json(newVideo);
    } catch (error) {
        console.error('Error creating video:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

//Api to edit the video for a lesson only if are the creator of the course.
export const updateVideo = async (req: RequestWithUser, res: Response) => {
    const video_id = req.params.id;
    const { description, poster_url, video_url, course_id } = req.body as updateVideoReqType;

    try {
        //check if the video id and course id are there
        if(!course_id || !video_id){
            return res.status(400).json({error: "video id and course id is required"});
        }
        //you can only edit the video for this lesson if you are the creator of the course
        const user_id = req.user?.id as string;
        if(!await areYouACreatorOfThisCourse(user_id, course_id)){
            return res.status(400).json({error: "you are not the authorize to edit this video for this lesson."});
        }

        //updating the video
        const updatedVideo = await prisma.video.update({
            where: {
                id: video_id,
            },
            data: {
                description: description,
                poster_url: poster_url,
                video_url: video_url,
            },
        });

        return res.status(200).json(updatedVideo);
    } catch (error) {
        console.error('Error updating video:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteVideo = async (req: RequestWithUser, res: Response) => {
    const video_id = req.query.video_id as string;
    const course_id = req.query.course_id as string;

    try {
        //check if the video id and course id are there
        if(!course_id || !video_id){
            return res.status(400).json({error: "video id and course id is required"});
        }
        //you can only edit the video for this lesson if you are the creator of the course
        const user_id = req.user?.id as string;
        if(!await areYouACreatorOfThisCourse(user_id, course_id)){
            return res.status(400).json({error: "you are not the authorize to edit this video for this lesson."});
        }
        
        await prisma.video.delete({
            where: {
                id: video_id,
            },
        });
        return res.status(204).send();
    } catch (error) {
        console.error('Error deleting video:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};