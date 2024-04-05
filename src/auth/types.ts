export interface RegisterRequestBody{
    name: string
    email: string;
    password: string;
    profile_image?: string;
}

export interface LoginRequestBody{
    email: string;
    password: string;
}

export interface updateProfileRequestBody{
    name?: string;
    email?: string;
    profile_image?: string;
}