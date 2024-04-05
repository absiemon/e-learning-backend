import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RequestWithUser } from '../middleware/verifyToken.ts';
import { createReviewReqType, updateReviewReqType } from './types.ts';

const prisma = new PrismaClient();

// API to create or give a review on a course by the user
export const createReview = async (req: RequestWithUser, res: Response) => {
    const { description, stars, course_id } = req.body as createReviewReqType;

    try {
        //getting the user from the req body after token verification.
        const user_id = req.user?.id as string;

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
    const courseId = req.query.course_id as string;
    try {
        //if course id is not given
        if(!courseId){
            return res.status(400).json({error: 'course_id is required'});
        }

        //getting all the reviews for the course
        const reviews = await prisma.review.findMany({
            where: {
                course_id: courseId,
            },
        });

        return res.status(200).json(reviews);
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
        //update will only happen if the the same user has created the review who is requesting this api
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
        //delete will only happen if the the same user has created the review who is requesting this api
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

        return res.status(204).send();
    } catch (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
