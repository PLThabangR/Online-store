import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import User from "../model/User.js";
import jwt from "jsonwebtoken"
import { redis } from  "../lib/redis.js"
import { generateTokens, storeRefreshTokens,setCookies } from "../lib/generateTokens.js";

export const signup = async(req,res)=>{
//destructure data from body
const { name, email, password } = req.body;


try {

    //check if user has filled all the required values
    if(!name || !email || !password){
        return res.status(404).json({ message: "Fill all required fields" });
    }
    
//check if user exist 
// const existingUser = await User.findOne({ name });
// 		if (existingUser) {
// 			return res.status(400).json({ message: "Name is already taken" });
// 		}

        //Check if email follows correct email pattern
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ message: "Invalid email format" });
		}

        //check if email is taken or not
        const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(400).json({ message: "Email is already taken" });
		}

        //Password must be greater than 6
        if (password.length < 6) {
			return res.status(400).json({ message: "Password must be at least 6 characters long" });
		}

        //Hash user paswword
        const salt = await bcrypt.genSalt(10)
        const hashedPassword= await bcrypt.hash(password,salt)

        //Create new user
        const newUser = new User({
			name,
			email,
			password: hashedPassword
		});
        //Save use to the db
        await newUser.save();

        //Generate access token and refresh
        const {accessToken,refreshToken} =generateTokens(newUser._id)

        //call function to store refresh token in the redis db
        await storeRefreshTokens(newUser._id,refreshToken)

        //Set cookies
        setCookies(res,accessToken,refreshToken);
        //give resopnse to the request
      if(newUser){
          res.status(201).json({user:{
            _id: newUser._id,
            name:newUser.name,
            email: newUser.email,
            //password:newUser.password, do not return the password to the user
           
        }, message:"User created succesfully"})
      }else{
          res.status(400).json({ message: "Invalid user data" });
      }

} catch (error) {
    res.status(400).json({ message: "Internal server error" });
}
}

export const login = async(req,res)=>{
res.send("Login")
    

}

export const logout =async (req,res)=>{
//We must clear the clokies when user clicks logout
try {
    //Grab the cookies from the url using cookie parser
    const refreshToken = req.cookies.refreshToken;
    //if cookies is found then decode and delete from redis
    if(refreshToken){
        //decode token and clear cookies
        const decoded = jwt .verify(refreshToken,process.env.REFRESH_TOKEN_SECRECT);
        await redis.del(`refresh_token:${decoded.id}`)//remove refresh token from redis database
        res.clearCookie("refreshToken")//clear the cookie refresh token
        res.clearCookie("accessToken")// clear the cookie access token
        res.status(200).json({message:"Logged out successfully"})
    }
    
} catch (error) {
     res.status(200).json({message:"Internal server error" ,error:error.message})
}
    
//JD5UFXXNFOcoxf8F
}
