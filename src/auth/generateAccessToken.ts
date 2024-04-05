//write a function to generate jwt token string
import jwt from 'jsonwebtoken';
import process from 'process';

interface payload{
  id: any
  email: string
  username: string
}

export async function generateToken(payload: payload) {
  try{
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });   
  }
  catch(err){
    throw new Error(err as string);
  }
}
