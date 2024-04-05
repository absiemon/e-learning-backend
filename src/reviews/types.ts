export interface createReviewReqType{
    stars: number;
    description?: string;
    course_id: string
}

export interface updateReviewReqType{
    stars?: number;
    description?: string;
}