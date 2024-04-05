import { Category } from "@prisma/client"

export interface createCourseRequestType{
    title: string
    description: string
    category: Category
    price: number
    currency: string
}