import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";    

//Configuring dotenv to use env variables
dotenv.config();

//Configuring cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRECT,
    secure: true,
});

//Exporting cloudinary to use in other files
export default cloudinary