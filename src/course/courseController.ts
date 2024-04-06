
import { Request, Response } from 'express';
import { Category, PrismaClient } from '@prisma/client';
import { RequestWithUser } from '../middleware/verifyToken.ts';
import { createCourseRequestType, updateCourseReqType } from './types.ts';
import { areYouACreatorOfThisCourse } from '../lesson/lessonController.ts';

const prisma = new PrismaClient();

// API to Create Course
export const createCourse = async (req: RequestWithUser, res: Response) => {
    const { title, ...restData } = req.body as createCourseRequestType;

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
        const user_id = req.user?.id as string;

        // Create the course
        const newCourse = await prisma.course.create({
            data: {
                title: title,
                ...restData,
                user: { connect: { id: user_id } }
            },
        });

        //If you are creating a course you will be automatically enrolled in the course to get full access to the course.
        await prisma.enrollment.create({
            data: {
                course: { connect: { id: newCourse.id } },
                user: { connect: { id: user_id } }
            },
        });

        return res.status(201).json(newCourse);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

// API to get a single Course
export const getCourse = async (req: RequestWithUser, res: Response) => {
    const course_id = req.params.id;

    try {
        //check if the video id and course id are there
        if (!course_id) {
            return res.status(400).json({ error: "course id is required" });
        }

        const course = await prisma.course.findUnique({
            where: {
                id: course_id,
            },
            include: {
                user: true // Including the creator details
            }
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        //getting all the reviews of this course
        const reviews = await prisma.review.findMany({
            where: {
                course_id: course_id,
            },
            include: {
                user: true
            }
        });

        //getting number of enrolled user
        const numberOfEnrolledUsers = await prisma.enrollment.count({
            where: {
                course_id: course_id,
            },
        });

        //If you are enrolled in this course then you will see lessons and videos along with the reviews
        const user_id = req.user?.id as string
        //checking whether you are enrolled in the course or not.
        const enrollmentCheck = await prisma.enrollment.findFirst({
            where: {
                course_id: course.id,
                user_id: user_id,
            }
        })

        //if you are not enrolled you can only see course details along with the reviews
        if (!enrollmentCheck) {
            return res.status(200).json({
                course: course,
                reviews: reviews,
                numberOfEnrolledUsers
            });
        }
        //fetching all the lessons of a course along with the videos. all videos for a particular lesson will be inside the lesson object
        const lessons = await prisma.lesson.findMany({
            where: {
                course_id: course.id,
            },
            include: {
                Video: true,
            }
        });

        return res.status(200).json({
            course: course,
            reviews: reviews,
            numberOfEnrolledUsers,
            lessons: lessons
        });
    } catch (error) {

        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

// API to get all the Course created by the user.
export const getAllCourse = async (req: RequestWithUser, res: Response) => {
    const user_id = req.user?.id as string;

    //adding pagination
    const page = parseInt(req.query.page as string) || 1; 
    const pageSize = parseInt(req.query.pageSize as string) || 10; 
    const category = req.query.category as Category; 
    const priceAsc = req.query.priceAsc as string; 
    const createdAtAsc = req.query.createdAtAsc as string; 

    try {
         //other filtering options like category, price
         let query: any = {}
         let sortBy: any = []
         if(category){
             query.category = category
         }
         if(priceAsc){
             priceAsc === 'true' ? 
             sortBy.push({ price: 'asc'}) : 
             sortBy.push({ price: 'desc'})
         }
         if(createdAtAsc){
             createdAtAsc === 'true' ? 
             sortBy.push({ created_at: 'asc'}) : 
             sortBy.push({ created_at: 'desc'})
         }

        //counting total available records
        const totalCount = await prisma.course.count({
            where: {
                user_id: user_id,
                ...query
            }
        });
        const totalPages = Math.ceil(totalCount / pageSize);

        //getting all the courses created by a user
        const courses = await prisma.course.findMany({
            where: {
                user_id: user_id,
                ...query
            },
            orderBy: sortBy,
            take: pageSize,
            skip: (page - 1) * pageSize,
        });

        return res.status(200).json({
            data: courses,
            totalPages,
            currentPage: page,
            pageSize,
            totalCount,
        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });

    }
};

//Api to get all available courses with filtering and sorting
export const getAllAvailableCourse = async (req: Request, res: Response) => {
    //adding pagination
    const page = parseInt(req.query.page as string) || 1; 
    const pageSize = parseInt(req.query.pageSize as string) || 10; 
    const category = req.query.category as Category; 
    const priceAsc = req.query.priceAsc as string; 
    const createdAtAsc = req.query.createdAtAsc as string; 
    const popularity = req.query.popularity as string

    try {
        //other filtering options like category, price
        let query: any = {}
        let sortBy: any = []
        if(category){
            query.category = category
        }
        if(priceAsc){
            priceAsc === 'true' ? 
            sortBy.push({ price: 'asc'}) : 
            sortBy.push({ price: 'desc'})
        }
        if(createdAtAsc){
            createdAtAsc === 'true' ? 
            sortBy.push({ created_at: 'asc'}) : 
            sortBy.push({ created_at: 'desc'})
        }

        //counting total available courses
        const totalCount = await prisma.course.count({});

        const totalPages = Math.ceil(totalCount / pageSize);

        //getting all the available courses
        const courses = await prisma.course.findMany({
            where:{
                ...query
            },
            orderBy: sortBy,
            take: pageSize,
            skip: (page - 1) * pageSize,
        });

        //sorting the courses based on popularity(number of enrolled user in that course)

        // Modifying the course to include the number of enrolled user for each course
        //since we have implemented pagination api response time won't hardly
        let modifiedCourse: any = await Promise.all(courses.map(async (course) => {
            const numberOfEnrollments = await prisma.enrollment.count({
                where:{
                    course_id: course.id
                }
            })
            return {
              ...course,
              enrollmentCount: numberOfEnrollments
            };
          }));

           // Sort by enrollment count
        if (popularity === 'true') {
            modifiedCourse.sort((a: any, b: any) => b.enrollmentCount - a.enrollmentCount);
        } else {
            modifiedCourse.sort((a: any, b: any) => a.enrollmentCount - b.enrollmentCount);
        }

        return res.status(200).json({
            data: modifiedCourse,
            totalPages,
            currentPage: page,
            pageSize,
            totalCount,
        });
        
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
}


// API to Update Course
export const updateCourse = async (req: RequestWithUser, res: Response) => {
    const course_id = req.params.id;
    const data = req.body as updateCourseReqType;

    try {
        //check if the video id and course id are there
        if (!course_id) {
            return res.status(400).json({ error: "course id is required" });
        }

        //you can only update the course if you are the creator of the course
        const user_id = req.user?.id as string;
        if (!await areYouACreatorOfThisCourse(course_id, user_id)) {
            return res.status(400).json({ error: "you are not the authorize to update the course." });
        }

        console.log(user_id)
        const updatedCourse = await prisma.course.update({
            where: {
                id: course_id,
            },
            data: {
                ...data
            },
        });

        return res.status(200).json(updatedCourse);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });

    }
};

// API to Delete a Course
export const deleteCourse = async (req: RequestWithUser, res: Response) => {
    const course_id = req.params.id;

    try {
         //check if the course id is there
         if (!course_id) {
            return res.status(400).json({ error: "course id is required" });
        }

        //you can only delete the course if you are the creator of the course
        const user_id = req.user?.id as string;

        if (!await areYouACreatorOfThisCourse(course_id, user_id)) {
            return res.status(400).json({ error: "you are not the authorize to delete the course." });
        }

        //deleting the course
        await prisma.course.delete({
            where: {
                id: course_id,
            },
        });

        //If the course is being deleted then delete the lesson associated with the course,
        //delete the videos associated with the lessons, delete the enrollments in the course as well
        await prisma.lesson.deleteMany({
            where: {
                course_id: course_id,
            },
        });

        await prisma.video.deleteMany({
            where: {
                course_id: course_id,
            },
        });

        await prisma.enrollment.deleteMany({
            where: {
                course_id: course_id,
            },
        });

        return res.status(200).json({message: "Deleted Successfully!"});
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });

    }
};
