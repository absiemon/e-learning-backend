export interface createVideoReqType{
    description: string
    poster_url?:   string
    video_url: string
    video_number: number
    lesson_id: string, 
    course_id: string
}

export interface updateVideoReqType{
    description?: string
    poster_url?:   string
    video_url?: string
    course_id: string
}