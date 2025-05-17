import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import User from "../model/User.js";
import jwt from "jsonwebtoken"
import { redis } from  "../lib/redis.js"
import { generateTokens, storeRefreshTokens,setCookies, generateAccessToken ,setAccessToken} from "../lib/generateTokens.js";

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

        //Generate access token and refresh token
        const {accessToken,refreshToken} =generateTokens(newUser._id)

        //call function to store refresh token in the redis db
        await storeRefreshTokens(newUser._id,refreshToken)

        //Set cookies
        setCookies(res,accessToken,refreshToken);
        //give resopnse to the request
      if(newUser){
          res.status(201).json({
            _id: newUser._id,
            name:newUser.name,
            email: newUser.email,
            role:newUser.role,
            message:"User created succesfully"
            //password:newUser.password, do not return the password to the user
           })
      }else{
          res.status(400).json({ message: "Invalid user data" });
      }

} catch (error) {
   console.log("Error in signup controller",error.message)
    res.status(500).json({ message: error.message || "Internal server error" });
}
}

export const login = async(req,res)=>{

    const {email , password} = req.body;
 try {  

     //Check if email follows correct email pattern
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ message: "Invalid email format" });
		}
    //find user by email and check if user exists
        const user = await User.findOne({ email });
        //Comparer password with hashed password in the DB
        //We use this syntax password, user?.password || "" To avoid runtime errors if user is null
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) {
			return res.status(400).json({ message: "Invalid email or password" });
		}

         //Generate access token and refresh token
        const {accessToken,refreshToken} =generateTokens(user._id)

        //call function to store refresh token in the redis db
        await storeRefreshTokens(user._id,refreshToken)

        //Set cookies
        setCookies(res,accessToken,refreshToken);
        //give resopnse to the request
        res.status(200).json({
            _id: user._id,
            name:user.name,
            email: user.email,
            role:user.role,
             message:"User logged in succesfully"
            //password:user.password, do not return the password to the user
           
        ,})

    
 } catch (error) {
    console.log("Error in login controller",error.message)
    res.status(500).json({ message: error.message || "Internal server error" });

 }
    

}

export const logout =async (req,res)=>{
//We must clear the clokies when user clicks logout
try {
    //Grab the cookies from the url using cookie parser
    const refreshToken = req.cookies.refreshToken;

    console.log(req.cookies)
    //if cookies is found then decode and delete from redis
    if(refreshToken){
        //decode token so we can get user ID ,expireIn and clear cookies
        const decoded = jwt .verify(refreshToken,process.env.REFRESH_TOKEN_SECRECT);
        await redis.del(`refresh_token:${decoded.userID}`)//remove refresh token from redis database
        res.clearCookie("refreshToken")//clear the cookie refresh token
        res.clearCookie("accessToken")// clear the cookie access token
        res.status(200).json({message:"Logged out successfully"})
    }else{
        return res.status(400).json({ message: "No refresh token found" });
    }
    
} catch (error) {
      console.log("Error in logout controller",error.message)
    res.status(500).json({ message:"Internal server error" });
}
    
//JD5UFXXNFOcoxf8F
}

//This will recreate or refresh the access token token 
export const refresh_token =async(req,res)=>{

      
   
try {
   
 //Grab the cookies from the url using cookie parser
   const refreshToken = req.cookies.refreshToken;
    
    if(!refreshToken){
       return res.status(401).json({message:"No refresh token found"})
    }
    //decode the refresh token
      const decoded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRECT);
      //Get refresh token from redis using the refresh_token key
      const storedToken = await redis.get(`refresh_token:${decoded.userID}`)//get refresh token from redis database
      console.log("Stored refresh token",storedToken)
//Compare the refresh token with the one in the redis database
      if(storedToken !== refreshToken){
       return  res.status(403).json({message:"Unauthorized invalid refresh token"})
      }
        //Refresh the access token
        const {accessToken} = generateAccessToken(decoded.userID);
        
        //call function to store set token
        setAccessToken(res,accessToken)
        //json response
      return  res.status(200).json({message:"Access token refreshed successfully"})
} catch (error) {
    console.log("Error in refresh controller",error.message)
   return   res.status(500).json({ message: error.message || "Internal Server Error" });
}
}

export const getProfile =async(req,res)=>{

    try {
        //return everything except the password
        const user = await User.findById(req.user._id).select("-password");
        //json response
		res.status(200).json(user);
    } catch (error) {
        //Error message
        console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
    }
}