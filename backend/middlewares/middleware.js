import jwt from "jsonwebtoken";
import User from "../model/User.js";

export const protectRoute= async(req,res,next)=>{

    try {
        //Check if user os authenticated
        const accessToken = req.cookies.accessToken;
        if(!accessToken){
            return res.status(401).json({message:"Unauthorized user - No acces token provide"})
        }

        try{
                //Verify the access token and store all the user information in decoded variable
       const decoded = jwt.verify(accessToken,process.env.Access_TOKEN_SECRECT)

       if(!decoded){
           return res.status(401).json({message:"No user found associated with the access token"})
       }
      
        //find the user by ID  and exclude the password
        const user = await User.findById(decoded.userID).select("-password");
        //Handle error if user does not exist in mongodb
        if(!user){
            return res.status(401).json({message:"Unauthorized user - user not found"})
        }

        //put this user to the request object
        req.user=user;
        //call the next middleware
        next()
        }catch(error){
            //check if the error is token expired
                if(error.name==="TokenExpiredError"){
                   // error message
                    return res.status(401).json({message:"Unauthorized user - Access token expired"})
                }
                //throw the error
              throw error;
        }
        
    } catch (error) {
        // error message
        console.log("Error in the protectRoute middleware",error.message)
         return res.status(500).json({message:error.message})
    }
}

export const adminRoute =(req,res,next)=>{
    //check if the user exit in the request object and if the user role is an admin
    if(req.user &&req.user.role ==="admin"){
        //call the next middleware function
        next()
    }else{
        //error message
        return res.status(401).json({message:"Unauthorized user - Admin only"})
    }
}