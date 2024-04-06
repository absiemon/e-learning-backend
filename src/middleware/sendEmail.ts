import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);

interface payload{
  to: string,
  subject: string,
  html: string
}

export async function sendEmail(data: payload) {

    try {
        await resend.emails.send({
            from: "E-learning <onboarding@resend.dev>",
            ...data, 
        })
    } catch (error: any) {
        throw new Error(error)        
    }
}