import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RequestWithUser } from '../middleware/verifyToken.ts';
import { sendEmail } from '../middleware/sendEmail.ts';
import { userFields } from '../auth/types.ts';

const prisma = new PrismaClient();

// API to enroll in a course Course
export const enrollInCourse = async (req: RequestWithUser, res: Response) => {
    const { course_id } = req.body;
    try {
        //getting the user id after token verification
        const user_id = req.user?.id as string;

        //check if the user id and course id are there
        if (!course_id || !user_id) {
            return res.status(400).json({ error: "user id and course id is required!" });
        }
        //check if the user is already enrolled in the course
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                user_id: user_id,
                course_id: course_id,
            }
        })

        if (enrollment) {
            return res.status(400).json({ error: "You are already enrolled in this course!" });
        }

        //create the enrollment
        await prisma.enrollment.create({
            data: {
                user: { connect: { id: user_id } },
                course: { connect: { id: course_id } },
            },
        });

        //getting course creator details
        const course = await prisma.course.findFirst({
            where:{
                id: course_id
            },
            include:{
                user: {
                    select: userFields
                } 
            }
        })

        //send the email to the creator of the course along with the enrolled user details
        const htmlContent = `
            <h1>Enrollment Details</h1>
            <ul>
                <li>
                    <p><strong>Course Title:</strong> ${course?.title}</p>
                    <p><strong>User Name:</strong> ${req.user?.username}</p>
                    <p><strong>Email:</strong> ${req.user?.email}</p>
                </li>
            </ul>`;

        const payload = {
            to: course?.user.email as string,
            subject: "Enrollment details",
            html:htmlContent
        }

        await sendEmail(payload)

        return res.status(200).json({ message: "Successfully enrolled in the course!" });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });

    }
}

//Api to get all the enrollments by the user
export const getAllEnrolledCourse = async (req: RequestWithUser, res: Response) => {

    //pagination 
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    try {
        //getting the user id after token verification
        const user_id = req.user?.id as string;

        //counting total enrolled courses
        const totalCount = await prisma.enrollment.count({
            where: {
                user_id: user_id,
            },
        })
        const totalPages = Math.ceil(totalCount / pageSize);

        //getting all the enrollments for the user
        const enrollments = await prisma.enrollment.findMany({
            where: {
                user_id: user_id,
            },
            include: {
                course: {
                    include: {
                        user: {
                            select: userFields
                        }  // Including the user details who created this course
                    },
                },
                user: {
                    select: userFields
                }  // Including the user details who has enrolled in this course
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        return res.status(200).json({
            data: enrollments,
            totalPages,
            currentPage: page,
            pageSize,
            totalCount,
        });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });

    }
}


//Api to get all the enrolled user for a course
export const getAllUserEnrolledInCourse = async (req: Request, res: Response) => {
    const course_id = req.query.course_id as string;

    //pagination 
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    try {
        //check if the user id and course id are there
        if (!course_id) {
            return res.status(400).json({ error: "course id is required!" });
        }

        //counting total user enrolled in this course
        const totalCount = await prisma.enrollment.count({
            where: {
                course_id: course_id,
            },
        })
        const totalPages = Math.ceil(totalCount / pageSize);

        //getting all the enrollments for the user
        const usersEnrolled = await prisma.enrollment.findMany({
            where: {
                course_id: course_id,
            },
            include: {
                course: true,
                user: {
                    select: userFields
                }
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        return res.status(200).json({
            data: usersEnrolled,
            totalPages,
            currentPage: page,
            pageSize,
            totalCount,
        });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
}

