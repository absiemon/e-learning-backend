import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RequestWithUser } from '../middleware/verifyToken.ts';
import { createReviewReqType, updateReviewReqType } from './types.ts';
import { userFields } from '../auth/types.ts';

const prisma = new PrismaClient();

// API to create or give a review on a course by the user
export const createReview = async (req: RequestWithUser, res: Response) => {
    const { description, stars, course_id } = req.body as createReviewReqType;

    try {
        //getting the user from the req body after token verification.
        const user_id = req.user?.id as string;

        //you cannot give review if you are creator of a course
        const course = await prisma.course.findFirst({
            where:{
                id: course_id,
            },
        })
        if(course?.user_id === user_id) {
            return res.status(400).json({ error: 'You cannot give review on this course!' });
        }

        //you cannot give review if you are not enrolled in this course
        const enrollment = await prisma.enrollment.findFirst({
            where:{
                user_id: user_id,
                course_id: course_id,
            }
        })
        if(!enrollment){
            return res.status(400).json({error: "You cannot give review on this course! as you have not enrolled!"});
        }

        //checking if the user has already given review on this course or not.
        const existingReview = await prisma.review.findFirst({
            where: {
                user_id: user_id,
                course_id: course_id,
            },
        });

        if (existingReview) {
            return res.status(400).json({ error: 'You have already given a review on this course' });
        }

        //creating a new review
        const newReview = await prisma.review.create({
            data: {
                description: description,
                stars: stars,
                user: { connect: { id: user_id } },
                course: { connect: { id: course_id } }
            },
        });

        return res.status(201).json(newReview);
    } catch (error) {
        console.error('Error creating review:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Api to get all the reviews on a particular course
export const getReviews = async (req: Request, res: Response) => {
    //pagination
    const page = parseInt(req.query.page as string) || 1; 
    const pageSize = parseInt(req.query.pageSize as string) || 10; 

    const courseId = req.query.course_id as string;
    try {
        //if course id is not given
        if(!courseId){
            return res.status(400).json({error: 'course_id is required'});
        }

        //counting total reviews on a course
        const totalCount = await prisma.review.count({
            where: {
                course_id: courseId,
            },
        }) 
        const totalPages = Math.ceil(totalCount / pageSize);

        //getting all the reviews for the course
        const reviews = await prisma.review.findMany({
            where: {
                course_id: courseId,
            },
            include:{
                user: {
                    select: userFields
                } 
            },
            take: pageSize,
            skip: (page - 1) * pageSize,
        });

        return res.status(200).json({
            data: reviews,
            totalPages,
            currentPage: page,
            pageSize,
            totalCount,
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


// Api to update the review given by the user
export const updateReview = async (req: RequestWithUser, res: Response) => {
    const reviewId = req.params.id;
    const data: updateReviewReqType = req.body;

    try {
        //checking if the review id is given or not
        if(!reviewId){
            return res.status(400).json({error:'review_id is required'});
        }

        //update will only happen if you have given this review
        const user_id = req.user?.id as string;
        const review = await prisma.review.findFirst({
            where: {
                id: reviewId,
            },
        });
        if(review?.user_id !== user_id){
            return res.status(400).json({error: 'You are not authorized to update this review'});
        }

        //updating the review
        const updatedReview = await prisma.review.update({
            where: {
                id: reviewId,
            },
            data: {
                ...data
            },
        });

        return res.status(200).json(updatedReview);
    } catch (error) {
        console.error('Error updating review:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Apis to delete the review made the user
export const deleteReview = async (req: RequestWithUser, res: Response) => {
    const reviewId = req.params.id;

    try {
        //checking if the review id is given or not
        if(!reviewId){
            return res.status(400).json({error:'review_id is required'});
        }
        //delete will only happen if if you have given this review
        const user_id = req.user?.id as string;
        const review = await prisma.review.findFirst({
            where: {
                id: reviewId,
            },
        });
        if(review?.user_id !== user_id){
            return res.status(400).json({error: 'You are not authorized to delete this review'});
        }
        
        //deleting the review
        await prisma.review.delete({
            where: {
                id: reviewId,
            },
        });

        return res.status(200).json({message: "Deleted Successfully!"});
    } catch (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
