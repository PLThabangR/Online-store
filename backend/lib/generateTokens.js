import jwt from "jsonwebtoken"
import { redis } from "./redis.js"


//A functio to create token
export const generateTokens=(userID)=>{
    //user id as a payload
    const accessToken= jwt.sign({userID},process.env.Access_TOKEN_SECRECT,{
        //This token will expire in 15 minutes
        expiresIn:"15m"
    })

     const refreshToken= jwt.sign({userID},process.env.REFRESH_TOKEN_SECRECT,{
        //This token will expire in 7 days
        expiresIn:"7d"
    })
    //return the token
    return {accessToken,refreshToken}

}


//Store the refresh token in the redis database
export const storeRefreshTokens= async (userID,refreshToken) => { 
    await redis.set(`refresh_token:${userID}`, refreshToken,"EX",7*24*60*60)//7days in seconds
}


//set cookies both access token and refresh token
export const setCookies=(res,accessToken,refreshToken)=>{
    //set access token
    res.cookie("accessTken", accessToken, {
	//	maxAge: 15 * 24 * 60 * 60 * 1000, //15 days in seconds
    // timeout in 15 minutes
         maxAge: 15 * 60 * 1000, //15 minutes in seconds
		httpOnly: true, // prevent XSS attacks cross-site scripting attacks cannot acced by javascript
		sameSite: "strict", // prevents CSRF attacks cross-site request forgery attacks/ cross site scripting attack
		secure: process.env.NODE_ENV !== "development"
	});
//set refresh token
    res.cookie("refreshToken", refreshToken, {
        //timeout in 7 days
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day in seconds
		httpOnly: true, // prevent XSS attacks cross-site scripting attacks
		sameSite: "strict", // CSRF attacks cross-site request forgery attacks
		secure: process.env.NODE_ENV !== "development",
	});
}