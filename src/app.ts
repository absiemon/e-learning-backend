import dotenv from 'dotenv';
dotenv.config();
import express from 'express'
import cors from "cors"
import morgan from 'morgan'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import router from './indexRoute.ts'; 

// setting up express server
const app = express();
app.use(express.json({limit: '50mb'}));
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json({
  limit: '50mb'
}))

app.use(morgan(
  'combined'
));
app.disable('etag')

//// setting up cors. Only allowed origin can make api request
const allowedOrigins: string[] = ['https://example.com'];
const corsOptions = {
    credentials: true,
    origin: allowedOrigins,
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: 'Content-Type, Authorization, Cookie'
};

app.use(cors(corsOptions));

app.get('/', (req, res)=>{
  return res.status(200).json({message: 'backend deployed'})
})

//routes
app.use('/v1', router);

const port = process.env.PORT || 8000;
app.listen(port, ()=> console.log("server is running") );
